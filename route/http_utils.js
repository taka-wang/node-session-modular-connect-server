var redirect = function(req, res, _url) { //help to redirect
        var url = "http://" + req.headers.host  + _url;
        res.statusCode = 302;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Location', url);
        res.end('Redirecting to ' + url);
    },
    writeHtml = function(res, str) { //help to response simple html
        res.setHeader('Content-Type', 'text/html');
        res.end(str);
    };

module.exports.redirect  = redirect;
module.exports.writeHtml = writeHtml;
