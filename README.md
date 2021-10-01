# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

Initial Landing Page:
!["Landing page - Welcome to TinyApp!"](https://github.com/sjoliver/tinyapp/blob/master/docs/landing-page.png?raw=true)

A List of Your Own Short & Long URLs:
!["My URLs Index View"](https://github.com/sjoliver/tinyapp/blob/master/docs/index.png?raw=true)

The Edit & Show View for a Given URL:
!["Edit/Show View for a URL"](https://github.com/sjoliver/tinyapp/blob/master/docs/edit-show.png?raw=true)

The Login Form:
!["Login page"](https://github.com/sjoliver/tinyapp/blob/master/docs/login.png?raw=true)


## Getting Started

- Install all below dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command (see below for alternative command).

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

### Start & Test Commands

Inside your package.json file, update the `scripts` section: 
```
"scripts": {
    "start": "./node_modules/.bin/nodemon -L express_server.js",
    "test": "./node_modules/mocha/bin/mocha"
```
- Run `npm start` in your terminal to run your server.
- Run `npm test` in your terminal to run your mocha tests.