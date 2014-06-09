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

var routes = require('./routes/index'),
    routeGroup = require('./routes/group/index');
    routeApi = require('./routes/api/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/group', routeGroup);
app.use('/api', routeApi);

// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
if (app.get('env') === 'development') {
    app.use(function(err, req, res) {
        if (err.status && err.status === 404) {
            return res.render('404', err);
        }
        res.status(err.status || 500);
        res.render('500', err);
    });
}
// production error handler
app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('500', {
        message: err.message,
    });
});

module.exports = app;
