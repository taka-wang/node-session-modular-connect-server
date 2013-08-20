Modular restful server with authentication
==============================

How to start
------
1. `git clone https://github.com/taka-wang/session-modular-connect-server.git`

2. `npm install`

3. `npm start` or `node app.js`

4. go to `http://127.0.0.1:3000`

Default accounts
------
1. account: `admin`, password: `1234`
2. account: `user`,  password: `1234`
3. account: `guest`, password: `1234`

How to extend
------
- In most case, you do not need to change the main.js file.
- Add your get/post handler in `route/http_get.js` or `route/http_post.js` respectively.
- You can also change your configuration from conf folder.

Why Connect 1.x
------
In short, it just fits (our restful server requirement).

- Why not express? 
  We need a thin skelton, not a railway framework.

- Why not connect 2.x?
  We need `connect.router` function, but keep other libraries dependency free.

License
------
MIT

