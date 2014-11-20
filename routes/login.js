/**
 * Login
 */

var express = require('express'),
    router = express.Router();

router.get('/', function(req, res) {
    var feedback = {
        title: 'Log In'
    };

    res.render('login', feedback);
});

module.exports = router;
