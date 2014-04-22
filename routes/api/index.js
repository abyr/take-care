var express = require('express'),
    router = express.Router(),
    Error = require("../../models/error").Error;

router.post('/', function(req, res) {
    res.send(501);
});

router.get('/', function(req, res) {
    res.send(501);
});

module.exports = router;