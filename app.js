/**
 * @fileoverview Connect server with client session. 
 * You must have client-sessions and connect 1.x installed. 
 * You can install the dependencies via npm install
 * @author Taka Wang
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var routeGet = require("./route/http_get.js"),
    routePost= require("./route/http_post.js"),
    h_utils  = require("./route/http_utils.js"),
    authInfo = require("./conf/auth.json"),
    svrInfo  = require("./conf/server.json"),
    sessions = require("client-sessions"),
    connect  = require("connect"),
    server,
    logFile;

//------------------------------------------------------------------------------
// Server setup
//------------------------------------------------------------------------------

if (svrInfo.devmode) {                      // dev mode logger
    server  = connect.createServer().use(connect.logger('dev'));
} else {                                    // production mode logger, timestamp filename or fixed filename
    logFile = require("fs").createWriteStream(
        svrInfo.logfile || require("moment")().format("MM-DD-HH-mm-ss") + ".txt", 
        {flag: "w"}
    );
    server  = connect.createServer().use(connect.logger({stream: logFile, format: "tiny"})); 
}

server                                      // DO NOT RE-ORDER THE SEQUENCES!!
    .use(connect.query())                   // query string handle
    .use(connect.bodyParser())              // post data handle
    .use(sessions({                         // session
        secret: authInfo.key,               // should be a large unguessable string
        duration: authInfo.duration * 1000, // how long the session will stay valid in ms
    }))
    .use(connect.router(function(app){
        var key;      
        for (key in routeGet.route) {       // route http get
            app.get(key, routeGet.route[key]);
        }
        for (key in routePost.route) {      // route http post
            app.post(key, routePost.route[key]);
        }
    }))
    .use(function(req, res, next) {         // auth check (multiple levels supported)
        if (typeof req.session_state.username === "undefined") {
            if (req.url === "/login.html") {// serve login page when not authed
                return next();              
            } else {                        // redirect all to login.html page when not authed
                h_utils.redirect(req, res, "/login.html");
            }
        } else {
            switch(req.url) {
            case "/login":                  // authed entry(pseudo url)
                if (req.session_state.username === "admin") { //redirect for admin
                    h_utils.redirect(req, res, "/index.html");
                } else {                    // redirect for user, guest, you can rewrite this case
                    h_utils.writeHtml(res, "Welcome " + req.session_state.username + "! (<a href='/logout'>logout</a>)");
                }
                break;
            case "/login.html":             // redirect to authed entry when authed
                h_utils.redirect(req, res, "/login");
                break;
            default:                        // serve static files
                next();
            }  
        }
    })
    .use(function(err, req, res, next) {    // error handling
        res.end("Internal Server Error");
    })
    .use(connect.favicon(__dirname + "/public/favicon.ico"))   //serve favicon
    .use(connect.static(__dirname + "/public/"))               //serve static files
    .use(function(req, res, next) {                            //404
        res.writeHead(404, "Not found", {'Content-Type': 'text/html'});
        res.end('<html><head><title>404 - Not found</title></head><body><h1>404 Not found.</h1></body></html>');
    })
    .listen(svrInfo.port, svrInfo.ip, function(){
        console.log("Port %s listening at %s", svrInfo.port, svrInfo.ip);
    });
