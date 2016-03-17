var express = require('express'),
    router = express.Router();

router.get('/', function (req, res) {
    var feedback = {
        title: 'Log In'
    };

    res.render('login', feedback);
});

router.post('/', function (req, res) {
    var feedback = {
        title: 'Log In'
    };

    var app = express(),
        env = app.get('env');

    if (env === 'development') {
        env = '';
    }
    appConfig = require('../config' + ((env) ? '.' + env : ''));

    console.log('user', req.body.email, '-', appConfig.admin.email);
    console.log('email', req.body.pass, '-', appConfig.admin.pass);

    if (req.body.email === appConfig.admin.email &&
        req.body.pass === appConfig.admin.pass) {
        console.log('ADMIN!!!');
    }

    res.render('login', feedback);
});

module.exports = router;
