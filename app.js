
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const initSocket = require('./socket.js');
let uploadRouter = require('./routes/upload');
let indexRouter = require('./routes/index');


const app = express();
const server = require('http').createServer(app);

initSocket(server);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', uploadRouter);

server.listen(7777);
module.exports = app;
