var express = require('express'),
    router = express.Router(),
    moment = require('moment'),
    ErrorLog = require("../../models/error").Error,
    defaultLimit = 10,
    methods = {};

router.post('/', function(req, res) {
    var message = req.body.message,
        error;

    if (!message) {
        res.send(400, {
            error: true,
            message: 'Message is required'
        });
    }

    errorLog = new ErrorLog({
        message: message,
        url: req.get('Referrer'),
        trace: req.body.stack,
        file: req.body.fileName,
        line: req.body.lineNumber,
    });

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

methods.getStartOfPeriod = function(period) {
    return +moment().startOf(period || 'day');
}

router.get('/', function(req, res) {
    var filters = {
        createdAt: {
            $gt: methods.getStartOfPeriod(req.body.period)
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
    var filters = {
        createdAt: {
            $gt: methods.getStartOfPeriod(req.body.period)
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

module.exports = router;
