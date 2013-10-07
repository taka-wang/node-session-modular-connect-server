var passwd		= require("../conf/passwd.json"),
	httpUtils   = require("./http_utils.js"),
	fs			= require("fs"),
	path		= require("path");
 
function logout (req, res, next) {
    var user = req.session_state.username;
    console.log(user + " logout..");
    req.session_state.reset();
    httpUtils.redirect(req, res, "/login.html");
}

function upload (req, res, next) {
	var fn = path.dirname(__dirname) + "/public/upload.html";
	fs.readFile(fn, function (err, data) {
		if (err){
			httpUtils.notFoundResp(res);
			throw err;
		}
		httpUtils.writeHtml(res, data);
	});
}
 
module.exports.route =
{
    "/logout" : logout,
    "/upload" : upload
    //more url/handler pairs
};
