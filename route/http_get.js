var passwd      = require("../conf/passwd.json"),
	listSetting = require("../conf/list.json"),
	httpUtils   = require("./http_utils.js"),
	fs          = require("fs"),
	path        = require("path"),
	mime		= require("mime"),
	format		= require("util").format;

module.exports.route = {
	"/logout"    : logout,
	"/upload"    : upload,
	"/list"      : list,
	"/uploads/*" : download
	//more url/handler pairs
};

function logout(req, res, next) {
	var user = req.session_state.username;
	console.log(user + " logout..");
	req.session_state.reset();
	httpUtils.redirect(req, res, "/login.html");
}

/**
 * [File download handler]
 * @param  {[object]}   req  [request object]
 * @param  {[object]}   res  [response object]
 * @param  {Function} next [description]
 */
function download(req, res, next) {
	var mimeType		= mime.lookup(req.params[0]),
		downloadFile	= "./uploads/" + req.params[0],
		strDisposition	= format("attachment; filename*=UTF-8''%s", path.basename(req.params[0]));

	fs.exists(downloadFile, function (_exist) {
		if (_exist) {
			fs.readFile(downloadFile, function (err, data) {
				if (err) {
					httpUtils.internelErrorResp(res);
				} else {
					fs.stat(downloadFile, function (err, stats) {
						if (err) {
							httpUtils.internelErrorResp(res);
						} else {
							res.writeHead(200, {
								"Content-Length"      : stats.size,
								"Content-Type"        : mimeType,
								"Content-Disposition" : strDisposition
							});
							res.write(data);
							res.end();
						}
					});
				}
			});
		} else {
			httpUtils.notFoundResp(res);
		}
	});
}

/**
 * [File upload handler]
 * @param  {[object]}   req  [request object]
 * @param  {[object]}   res  [response object]
 * @param  {Function}   next [function]
 */
function upload(req, res, next) {
	var fn = path.dirname(__dirname) + "/public/upload.html";
	fs.readFile(fn, function(err, data) {
		if (err) {
			httpUtils.notFoundResp(res);
			throw err;
		}
		httpUtils.writeHtml(res, data);
	});
}

/**
 * [Folder list handler]
 * @param  {[object]}   req  [request object]
 * @param  {[object]}   res  [response object]
 * @param  {Function}   next [function]
 */
function list(req, res, next) {
	var uploadDirName = "/uploads",
		listDir = path.dirname(__dirname) + uploadDirName,
		_filter = {
			depth  : listSetting.depth,
			hidden : listSetting.hidden,
			root   : listDir
		};

	readDirectory(listDir, function(err, jsonData) {
		if (err) {
			httpUtils.internelError(res);   // 500 internel server error
			throw err;
		} else {
			setTimeout(function() {
				res.setHeader("Content-Type", "application/json");
				httpUtils.jsonResp(res, jsonData);
			}, 100);
		}
	}, _filter);

	/**
	 * [calcDepth description]
	 * @param  {[string]} _rootDir [root directory path]
	 * @param  {[string]} _curDir  [prepare to compare with rootdir]
	 * @return {[number]}         [current depth]
	 */
	function calcDepth(_rootDir, _curDir) {
		var isWin   = !! process.platform.match(/^win/),
			relPath = "/" + path.relative(_rootDir, _curDir);

		if (isWin) {
			relPath = relPath.replace(/\b\\\b/gi, "/");
		}
		return relPath.match(/\//g).length;
	}

	/**
	 * read a directory (recursively deep)
	 * data[] = an object for each element in the directory
	 *      .name = item's name (file or folder name)
	 *      .stat = item's stat (.stat.isDirectory() == true IF a folder)
	 *      .children = another data[] for the children
	 * filter = an object with various filter settings:
	 *      .depth      = max directory recursion depth to travel
	 *                      (0 or missing means: infinite)
	 *                      (1 means: only the folder passed in)
	 *      .hidden     = true means: process hidden files and folders (defaults to false)
	 *      .callback   = callback function: callback(name, path, filter) -- returns truthy to keep the file
	 *
	 *
	 * @param path      = path to directory to read (".", ".\apps")
	 * @param callback  = function to callback to: callback(err, data)
	 * @param [filter]  = (optional) filter object
	 */
	function readDirectory(_path, callback, filter) {
		// queue up a "readdir" file system call (and return)
		fs.readdir(_path, function(err, files) {
			if (err) {
				callback(err);
				return;
			}

			// true means: process hidden files and folders
			var doHidden = false;

			if (filter && filter.hidden) {
				// filter requests to process hidden files and folders
				doHidden = true;
			}

			// count the number of "stat" calls queued up
			var count = 0;

			// count the number of "folders" calls queued up
			var countFolders = 0;

			// the data to return
			var data = [];

			// iterate over each file in the dir
			files.forEach(function(title) {
				// ignore files that start with a "." UNLESS requested to process hidden files and folders
				if (doHidden || title.indexOf(".") !== 0) {
					// queue up a "stat" file system call for every file (and return)
					count += 1;
					fs.stat(_path + "/" + title, function(err, stat) {
						if (err) {
							callback(err);
							return;
						}

						var processFile = true;

						if (filter && filter.callback) {
							processFile = filter.callback(title, stat, filter);
						}

						if (processFile) {
							var obj = {
								title: title,
								path: "." + uploadDirName + "/" + title
							};

							if (stat.isFile()) {
								obj.size = stat.size;
							}

							// push data 
							data.push(obj);

							if (stat.isDirectory()) {
								countFolders += 1;

								// add this property - lester_hu@bandrich.com [2013/09/14]
								obj.isFolder = true;

								// perform "readDirectory" on each child folder (which queues up a readdir and returns)
								(function(obj2) {
									var nextPath = _path + "/" + title,
										curDepth = calcDepth(filter.root, nextPath);

									// check depth before recursive - lester_hu@bandrich.com [2013/09/25]
									if (filter.depth && curDepth > filter.depth) {
										// too deep! we don't remove whole object, just assign null array for current object - lester_hu@bandrich.com [2013/09/25]
										obj2.children = [];
										countFolders -= 1;
										callback(undefined, data);
									} else {
										readDirectory(nextPath, function(err, data2) {
											if (err) {
												callback(err);
												return;
											}
											// entire child folder info is in "data2" (1 fewer child folders to wait to be processed)
											countFolders -= 1;
											obj2.children = data2;
											if (countFolders <= 0) {
												// sub-folders found. This was the last sub-folder to processes.
												callback(undefined, data); // callback w/ data
											} else {
												// more children folders to be processed. do nothing here.
											}
										}, filter);
									}
								})(obj);
							}
						}

						// one more file has been processed (or skipped)
						count -= 1;
						if (count <= 0) {
							// all files have been processed.
							if (countFolders <= 0) {
								// no sub-folders were found. DONE. no sub-folders found
								callback(undefined, data); // callback w/ data
							} else {
								// children folders were found. do nothing here (we are waiting for the children to callback)
							}
						}
					});
				}
			});

			// if no "stat" calls started, then this was an empty folder
			if (count <= 0) {
				// callback w/ empty
				callback(undefined, []);
			}
		});
	}
}