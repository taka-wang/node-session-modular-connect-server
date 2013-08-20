modular server with authentication
==============================

How to start
------
`npm install`

`npm start` or `node app.js`

How to extend
------
- In most case, you do not need to change the main.js file.
- Add your get/post handler in `route/http_get.js` or `route/http_post.js` respectively.
- You can also change your configuration from conf folder.

Why Connect 1.x
------
- Why not express? 
  We need a thin skelton, not a railway framework
- Why not connect 2.x?
  We need `connect.router` function, no another small library dependency.

License
------
MIT

