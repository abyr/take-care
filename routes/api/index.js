var express = require('express'),
    router = express.Router(),
    moment = require('moment'),
    _ = require('lodash'),
    ErrorLog = require("../../models/error").ErrorLog,
    defaultLimit = 10,
    methods = {};

// record new error log
router.post('/', function(req, res) {

    console.log('body', req.body);

    var message = req.body.message,
        error;

    if (!message) {
        res.send(400, {
            error: true,
            message: 'Message is required'
        });
    }

    errorLog = new ErrorLog({
        message: message[0],
    });

    if (req.body.url) {
        errorLog.url = req.body.url[0];
    }

    if (req.body.lineNumber) {
        errorLog.line = req.body.lineNumber[0];
    }

    if (req.body.symbolNumber) {
        errorLog.symbol = req.body.symbolNumber[0];
    }

    /*
        referrer: req.get('Referrer'),
        trace: req.body.stack,
        url: req.body.url,
        line: +req.body.lineNumber,
        symbol: +req.body.symbolNumber,
        browser: req.body.browser
     */



    console.log('error', errorLog);

    errorLog.save(function(err) {
        if (err) {
            return res.send(500, {
                error: true,
                message: err.message
            });
        }
        res.send(201, JSON.stringify(errorLog));
    });

});

// get first date (ts) of the period ('day', 'month', etc.)
methods.getStartOfPeriod = function(period) {
    return +moment().startOf(period);
}

router.get('/', function(req, res) {
    var period = req.body.period || req.query.period || 'day',
        filters = {
            createdAt: {
                $gt: methods.getStartOfPeriod(period)
            }
        };

    ErrorLog.find(filters, function(err, data) {
        if (err) {
            return res.send(500, {
                error: true,
                message: err.message
            });
        }
        res.send(200, data);
    });
});

router.get('/count', function(req, res) {
    var period = req.body.period || req.query.period || 'day',
        filters = {
            createdAt: {
                $gt: methods.getStartOfPeriod(period)
            }
        };

    ErrorLog.count(filters, function(err, count) {
        if (err) {
            return res.send(500, {
                error: true,
                message: err.message
            });
        }
        res.send(200, {
            count: count
        });
    });
});

// clear all logs before the period ('day', 'week', 'month', etc.)
router.delete('/', function(req, res) {
    var period = req.body.period || req.query.period || 'year',
        filters = {
            createdAt: {
                $lt: methods.getStartOfPeriod(period)
            }
        };

    ErrorLog.find(filters, function(err, data) {
        if (err) {
            return res.send(500, {
                error: true,
                message: err.message
            });
        }
        if (data) {
            _.each(data, function(doc) {
                doc.remove(function(err, data) {
                    if (err) {
                        return res.send(500, {
                            error: true,
                            message: err.message
                        });
                    }
                });
            });
        }
        // todo async response
        res.send(200, {
            count: data.length || 0
        });
    });
});

module.exports = router;
