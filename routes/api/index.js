var express = require('express'),
    router = express.Router(),
    moment = require('moment'),
    _ = require('lodash'),
    async = require('async'),
    ErrorLog = require("../../models/error").ErrorLog,
    defaultLimit = 10,
    methods = {

        // process indexed data using index
        makeErrorFromRequest: function(req, index) {

            var body = req.body,
                i = index,
                message, url, lineNumber, symbolNumber;

            // referrer: req.get('Referrer'),
            // trace: req.body.stack,
            // url: req.body.url,
            // line: +req.body.lineNumber,
            // symbol: +req.body.symbolNumber,
            // browser: req.body.browser

            if (typeof i !== 'undefined') { // allow zero index
                message = body.message[i];
                url = body.url[i];
                line = body.lineNumber[i];
                symbol = (body.symbolNumber && body.symbolNumber[i])
                    ? body.symbolNumber[i]
                    : null;
            } else {
                message = body.message;
                url = body.url;
                line = body.lineNumber;
                symbol = body.symbolNumber || null;
            }

            errorLog = new ErrorLog({
                message: message,
                url: url,
                line: +line
            });

            if (symbol) {
                errorLog.symbol = +symbol;
            }

            return errorLog;
        }
    };

// record new error log
router.post('/', function(req, res) {

    var message = req.body.message,
        errorLog,
        errorLogs = [],
        i = 0;

    if (!message) {
        res.send(400, {
            error: true,
            message: 'Message is required'
        });
    }

    if (typeof message === 'object') { // array
        // iterate all
        for (i = 0; i < message.length; i++) {
            errorLogs.push(methods.makeErrorFromRequest(req, i));
        }
    } else {
        // make single
        errorLog = methods.makeErrorFromRequest(req);
    }

    // save single error
    errorLog && errorLogs.push(errorLogs);

    if (!errorLogs.length) {
        return res.send(400, {
            error: true,
            message: 'No errors to save'
        })
    }

    // save several errors
    async.each(errorLogs, function(errorLog, callback) {
        // save single error
        errorLog && errorLog.save(function(err) {
            if (err) {
                // error on save
                return callback(err);
            }
            // saved
            callback(null, errorLog);
        });

    }, function(err) {
        if (err) {
            return res.send(500, {
                error: true,
                message: err.message
            });
        }

        // saved
        res.send(201, JSON.stringify(errorLogs));
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
