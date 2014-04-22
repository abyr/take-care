var express = require('express'),
    router = express.Router(),
    ErrorLog = require("../../models/error").Error;

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
    res.send(501);
});

module.exports = router;
