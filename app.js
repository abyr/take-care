/* jshint unused: false */
var express = require('express'),
    mongoose = require('mongoose'),
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    app = express(),
    env = app.get('env'),
    appConfig;

if (env === 'development') {
    env = '';
}
appConfig = require('./config' + ((env) ? '.' + env : ''));

mongoose.connect(appConfig.db.connection);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function callback() {
    console.log("mongodb has been started");
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes
var routes = require(path.join(__dirname, 'routes'));

app.use('/', routes.activity);
app.use('/activity', routes.activity);
app.use('/details', routes.details);
app.use('/api', routes.api);

// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        if (err.status && err.status === 404) {
            console.log(err);
            return res.render('404', {
                message: err.message
            });
        }
        res.status(err.status || 500);
        res.render('500', {
            message: err.message,
            stack: err.stack
        });
    });
}
// production error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('500', {
        message: err.message,
    });
});

module.exports = app;
