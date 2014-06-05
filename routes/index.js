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
        page = +req.body.page || +req.query.page || 1,
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
        periods = ['day', 'week', 'month', 'year'],
        paginationItems = [],
        feedback;

    async.series({
        count: function(callback) {
            ErrorLog.count(filters, function(err, count) {
                if (err) {
                    return res.render('error', err);
                }
                callback(null, count);
            });
        }

    }, function(err, results) {
        if (err) {
            return res.render('error', err);
        }
        feedback = {
            title: 'Errors :: Take Care',
            errors: [],
            period: period,
            periods: _.map(periods, function(p) {
                return {
                    title: p,
                    active: (p === period)
                }
            })
        }

        // not found
        if (!results.count) {
            return res.render('index', feedback);
        }
        pages = Math.ceil(results.count / pagination.limit);
        if (page > pages) {
            feedback.title = 'Page not found';
            if (err) {
                return res.render('error', err);
            }
        }

        paginationItems.push({
            title: '<<',
            page: 1,
        });
        paginationItems.push({
            title: 'prev',
            page: +page-1
        });
        paginationItems.push({
            title: 'next',
            page: +page+1
        });
        paginationItems.push({
            title: '>>',
            page: +pages
        });


        // skip as filter
        pagination.skip = pagination.limit * (page - 1);

        ErrorLog.find(filters, null, pagination, function(err, errorLogs) {
            if (err) {
                return res.render('error', err);
            }
            pagination.page = page;
            pagination.pages = pages;

            pagination.items = _.each(paginationItems, function(p) {
                p.active = (p.page === page || p.page < 1 || p.page > pages);
            });

            feedback.pagination = pagination;
            feedback.errors = errorLogs.map(function(log) {
                log.datetime = moment(log.createdAt).format('MMMM Do YYYY, h:mm:ss a');
                return log;
            });
            res.render('index', feedback);
        });
    });

});

module.exports = router;