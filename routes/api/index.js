var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    async = require('async'),
    Period = require('../../helpers/period'),
    ErrorLog = require("../../models/error").ErrorLog,
    methods = {

        // process indexed data using index
        makeErrorFromRequest: function(req, index) {

            var body = req.body,
                i = index,
                message, url, browser, beforeLoad, fake;

            if (typeof i !== 'undefined') { // allow zero index
                fake = (body.fake && body.fake[i]) ? !!body.fake : false;

                message = body.message[i];
                url = body.url[i];
                line = body.lineNumber[i];
                symbol = (body.symbolNumber && body.symbolNumber[i]) ? +body.symbolNumber[i]: null;
                browser = body.browser[i];
                beforeLoad = body.beforeLoad[i];

            } else {
                fake = body.fake;
                message = body.message;
                url = body.url;
                line = body.lineNumber;
                symbol = body.symbolNumber || null;
                browser = body.browser;
                beforeLoad = body.beforeLoad;
            }

            errorLog = new ErrorLog({
                message: message,
                url: url,
                line: +line,
                beforeLoad: Boolean(+beforeLoad),
                occuredTimes: 0,
                createdAt: (+new Date())
            });

            if (symbol) {
                errorLog.symbol = symbol;
            }
            if (fake) {
                errorLog.fake = fake;
            }
            if (browser) {
                errorLog.browser = browser;
            }

            return errorLog;
        }
    };

// record new error log
router.post('/', function(req, res, next) {

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
    if (errorLog) {
        errorLogs.push(errorLogs);
    }

    if (!errorLogs.length) {
        return next({
            status: 400,
            message: 'No errors to save'
        });
    }

    // save several errors
    async.each(errorLogs, function(errorLog, callback) {
        // save single error
        errorLog.save(function(err) {
            if (err) {
                // error on save
                return callback(err);
            }
            // saved
            return callback(null, errorLog);
        });
    }, function(err) {
        if (err) {
            return next(err);
        }
        // all saved
        res.send(201, JSON.stringify(errorLogs));
    });
});

router.get('/', function(req, res, next) {
    var period = req.body.period || req.query.period || 'day',
        filters = {
            createdAt: {
                $gt: Period.getStartOf(period)
            }
        };

    ErrorLog.find(filters, null, {
        sort: {
            createdAt: -1
        }
    }, function(err, data) {
        if (err) {
            return next(err);
        }
        res.json(data);
    });
});

router.get('/count', function(req, res) {
    var period = req.body.period || req.query.period || 'day',
        filters = {
            createdAt: {
                $gt: Period.getStartOf(period)
            }
        };

    ErrorLog.count(filters, function(err, count) {
        if (err) {
            return res.send(500, {
                error: true,
                message: err.message
            });
        }
        res.json({
            count: count
        });
    });
});

// clear all logs before the period ('day', 'week', 'month', etc.)
router.delete('/', function(req, res, next) {
    var period = req.body.period || req.query.period || 'year',
        filters = {
            createdAt: {
                $lt: Period.getStartOf(period)
            }
        };

    ErrorLog.find(filters, function(err, data) {
        if (err) {
            return next(err);
        }
        _.each(data, function(doc) {
            doc.remove(function(err) {
                if (err) {
                    return res.send(500, {
                        error: true,
                        message: err.message
                    });
                }
            });
        });

        res.json({
            count: data.length || 0
        });
    });
});

module.exports = router;
