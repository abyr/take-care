var express = require('express'),
    async = require('async'),
    moment = require('moment'),

    router = express.Router(),
    api = require('./api/index'),
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
            limit: 10,
            sort: {
                createdAt: -1
            }
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
        if (err) {
            return res.send(500, {
                error: true,
                message: err.message
            });
        }

        if (!results.count) {
            return res.render('index', {
                title: 'Take Care',
                errors: []
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

        ErrorLog.find(filters, null, pagination, function(err, logs) {
            if (err) {
                return res.render(err);
            }

            pagination.page = page;
            pagination.pages = pages;

            logs = logs.map(function(log){
                log.datetime = moment(log.createdAt).format('MMMM Do YYYY, h:mm:ss a');
                return log;
            })

            res.render('index', {
                title: 'Take Care',
                errors: logs,
                pagination: pagination
            });
        });
    });

});

module.exports = router;
