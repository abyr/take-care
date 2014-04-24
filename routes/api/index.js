var express = require('express'),
    router = express.Router(),
    ErrorLog = require("../../models/error").Error,
    limit = 10;

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
        message: message
    });

    errorLog.save(function(err){
        if (err) {
            return res.send(500, {
                error: true,
                message: err.message
            });
        }
        res.send(201, JSON.stringify(errorLog));
    });

});

router.get('/', function(req, res) {
    // available filters
    // passed filters
    // defaults
    var filters = {};

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
    var filters = {};

    ErrorLog.collection.count(filters, function (err, count) {
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
