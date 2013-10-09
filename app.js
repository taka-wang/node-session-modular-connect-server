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
    utils    = require("./route/utils.js"),
    authInfo = require("./conf/auth.json"),
    svrInfo  = require("./conf/server.json"),
    sessions = require("client-sessions"),
    connect  = require("connect"),
    server,
    logFile;

//------------------------------------------------------------------------------
// Server setup
//------------------------------------------------------------------------------

if (svrInfo.devmode) {                          // dev mode logger
    server  = connect.createServer().use(connect.logger('dev'));
} else {                                        // production mode logger, timestamp filename or fixed filename
    logFile = require("fs").createWriteStream(
        svrInfo.logfile || require("moment")().format("MM-DD-HH-mm-ss") + ".txt",
        {flag: "w"}
    );
    server  = connect.createServer().use(connect.logger({stream: logFile, format: "tiny"}));
}

server                                          // DO NOT RE-ORDER THE SEQUENCES!!
    .use(connect.query())                       // query string handle
    .use(connect.bodyParser({
        uploadDir : __dirname + '/uploads',     // post data handle
        keepExtensions:true,
        defer : true
    }))
    .use(sessions({                             // session
        secret: authInfo.key,                   // should be a large unguessable string
        duration: authInfo.duration * 1000,     // how long the session will stay valid in ms
        cookie: {
            maxAge: authInfo.duration * 1000,   // duration of the cookie in milliseconds, defaults to duration above
            ephemeral: true                     // when true, cookie expires when the browser closes
        }
    }))
    .use(connect.router(function(app){
        app.all("*", function(req, res, next) {
            utils.checkAuthentication(req, res, next);
        });

        var key;
        for (key in routeGet.route) {           // route http get
            app.get(key, routeGet.route[key]);
        }
        for (key in routePost.route) {          // route http post
            app.post(key, routePost.route[key]);
        }
    }))
    .use(function(err, req, res, next) {        // error handling
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

// Handle exception otherwise node will crash when error occured
process.on('uncaughtException', function(err) {
    console.error(err.stack);
});