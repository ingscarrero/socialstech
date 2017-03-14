'use strict';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');

/// SST Modules
var sstAccessControl = require('./routes/sst-access-control');
var sstInteraction = require('./routes/sst-interaction');
var sstDemographics = require('./routes/sst-demographics');
var sstContent = require('./routes/sst-content');
var sstMail = require('./routes/sst-mail');
var sstRequest = require('./routes/sst-request');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'ui')));


/// App Routing
app.use('/', index);
app.use('/api/sst/interaction', sstInteraction);
app.use('/api/sst/demographics', sstDemographics);
app.use('/api/sst/content', sstContent);
app.use('/api/sst/security', sstAccessControl);
app.use('/api/sst/mail', sstMail);
app.use('/api/sst/request', sstRequest);

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
  next();
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(err);

  res.status(err.status || 500).jsonp({
    code: err.code,
    message: err.message,
    error: err.error
  });
});

module.exports = app;