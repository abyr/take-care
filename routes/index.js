var express = require('express'),
    async = require('async'),
    moment = require('moment'),
    _ = require('lodash'),

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
        },
        periods = [{
            title: 'day',
            active: false
        },
        {
            title: 'week',
            active: false
        },
        {
            title: 'month',
            active: false
        }];

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
            });

            periods = _.each(periods, function(p){
                p.active = (p.title === period);
            });

            res.render('index', {
                title: 'Take Care',
                errors: logs,
                pagination: pagination,
                periods: periods,
                period: period
            });
        });
    });

});

module.exports = router;
