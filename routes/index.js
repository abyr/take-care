var express = require('express'),
    async = require('async'),
    router = express.Router();


var api = require('./api/index'),
    Period = require('../helpers/period'),
    ErrorLog = require("../models/error").ErrorLog;

router.get('/', function(req, res) {

    var period = req.body.period || req.query.period || 'day',
        page = req.body.page || req.query.page || 1,
        pages,
        filters = {
            createdAt: {
                $gt: Period.getStartOf(period)
            }
        },
        pagination = {
            skip: 0,
            limit: 10
        };

    async.series({

        count: function(callback) {
            ErrorLog.count(filters, function(err, count) {
                if (err) {
                    return res.send(500, {
                        error: true,
                        message: err.message
                    });
                }
                callback(null, count);
            });
        }

    }, function(err, results) {

        console.log('count !! ', results.count);

        if (err) {
            return res.send(500, {
                error: true,
                message: err.message
            });
        }

        if (!results.count) {
            return res.render('index', {
                title: 'Take Care',
                errors: [],
                pagination: pagination
            });
        }


        pages = Math.ceil(results.count / pagination.limit);

        if (page > pages) {
            return res.send(404, {
                error: true,
                message: 'Page not found'
            });
        }

        pagination.skip = pagination.limit * (page - 1);

        ErrorLog.find(filters, null, pagination, function(err, data) {
            if (err) {
                return res.render(err);
            }

            pagination.page = page;
            pagination.pages = pages;

            res.render('index', {
                title: 'Take Care',
                errors: data,
                pagination: pagination
            });
        });
    });

});

module.exports = router;
