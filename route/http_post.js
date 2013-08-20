var passwd   = require("../conf/passwd.json"),
    redirect = require("./http_utils.js").redirect;  
 
function login (req, res, next) {
    if (passwd[req.body.username] === req.body.password) {
        req.session_state.username = req.body.username;
        redirect(req, res, "/");    //must for ajax call
    } else {
        res.writeHead(403);         //Forbidden
        res.end("");
    }
}

module.exports.route = 
{
    "/login"  : login
};
