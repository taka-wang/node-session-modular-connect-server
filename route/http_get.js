var passwd   = require("../conf/passwd.json"),
    redirect = require("./http_utils.js").redirect;  
 
function logout (req, res, next) {
    var user = req.session_state.username;
    console.log(user + " logout..");
    req.session_state.reset();
    redirect(req, res, "/login.html");
}
 
module.exports.route = 
{
    "/logout" : logout
    //more url/handler pairs
};
