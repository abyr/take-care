/**
 * Statistic
 */

var express = require('express'),
    router = express.Router();

router.get('/', function(req, res) {
    var feedback = {
        title: 'Statistic'
    };

    res.render('stats', feedback);
});

module.exports = router;
