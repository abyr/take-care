var express = require('express'),
    router = express.Router(),
    ErrorLog = require("../models/error").ErrorLog;

router.get('/', function (req, res, next) {
    var period = req.body.period || req.query.period || false;

    if (period) {
        ErrorLog.removeLaterThen(period, function (err) {
            if (err) {
                return next(err);
            }
            res.render('tools', {
                title: 'Tools',
                period: period
            });
        });
    } else {
        res.render('tools', {
            title: 'Tools',
            periods: ['year', 'month']
        });
    }
});

module.exports = router;
