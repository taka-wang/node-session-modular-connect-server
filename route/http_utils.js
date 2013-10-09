var redirect = function (req, res, _url) {   //help to redirect
        var url = "http://" + req.headers.host  + _url;
        res.statusCode = 302;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Location', url);
        res.end('Redirecting to ' + url);
    },
    writeHtml = function (res, str) {        // help to response simple html
        res.setHeader('Content-Type', 'text/html');
        res.end(str);
    },
    notFoundResp = function (_res) {         // help to response 404 Not Found
        _res.statusCode = 404;
        _res.end("File Not Found");
    },
    internelErrorResp = function (_res) {    // help to response 500 Internel Server Error
        _res.statusCode = 500;
        _res.end("Internel Server Error");
    },
    jsonResp = function (_res, _data) {      // help to response with json format
        _res.end(JSON.stringify(_data));
    };

module.exports.redirect          = redirect;
module.exports.writeHtml         = writeHtml;
module.exports.notFoundResp      = notFoundResp;
module.exports.internelErrorResp = internelErrorResp;
module.exports.jsonResp          = jsonResp;
