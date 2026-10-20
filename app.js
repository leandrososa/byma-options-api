var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var scraping = require('./routes/options');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', scraping);

app.use(function(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);
  return res.status(502).json({ error: 'Options data is temporarily unavailable' });
});

module.exports = app;
