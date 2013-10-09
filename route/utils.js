var	h_utils = require("./http_utils.js"),
	fs		= require("fs"),
	checkAuthentication = function (req, res, next) {
		if (typeof req.session_state.username === "undefined") {
			if (req.url.match("/login") === null) {
				h_utils.redirect(req, res, "/login.html");
			} else {
				next();
			}
		} else {
			if (req.session_state.username === "guest" &&
				req.url.match("/logout") === null) {
				h_utils.writeHtml(res, "Welcome " + req.session_state.username + "! (<a href='/logout'>logout</a>)");
			} else {
				next();
			}
		}
	};

module.exports.checkAuthentication = checkAuthentication;