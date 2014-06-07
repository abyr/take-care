var express = require('express'),
    async = require('async'),
    moment = require('moment'),
    _ = require('lodash'),
    router = express.Router(),
    ff = require('../helpers/featureFlags'),
    Period = require('../helpers/period'),
    Pagination = require('../helpers/pagination'),
    ErrorLog = require("../models/error").ErrorLog;

router.get('/', function(req, res, next) {
    var period = req.body.period || req.query.period || 'day',
        page = +req.body.page || +req.query.page || 1,
        limit = +req.body.limit || +req.query.limit || 1,
        pages,
        filters = {
            createdAt: {
                $gt: Period.getStartOf(period)
            }
        },
        pagination = false,
        periods = ['day', 'week', 'month', 'year'],
        feedback;

    async.series({
        count: function(callback) {
            ErrorLog.count(filters, function(err, count) {
                if (err) {
                    return next(err);
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

        pages = Math.ceil(results.count / limit);
        if (page > pages) {
            feedback.title = 'Page not found';
            if (err) {
                return res.render('error', err);
            }
        }

        pagination = (new Pagination(page, limit, pages)).setSort({
            createdAt: -1
        });

        ErrorLog.find(filters, null, pagination, function(err, errorLogs) {
            if (err) {
                return res.render('error', err);
            }

            async.each(errorLogs, function(errorLog, callback) {

                errorLog.datetime = Period.daytime(errorLog.createdAt);
                errorLog.ago = Period.ago(errorLog.createdAt);

                ErrorLog.count({
                    message: errorLog.message
                }, function(err, count) {
                    if (err) {
                        return res.render('error', err);
                    }
                    errorLog.occuredTimes = count;

                    callback(null, errorLog);
                });

            }, function(err, results) {

                if (ff('pagination')) {
                    pagination.items = _.each(pagination.navs, function(p) {
                        p.active = (p.page === page || p.page < 1 || p.page > pagination.pages);
                    });
                    feedback.pagination = pagination;
                }

                feedback.errors = errorLogs;
                res.render('index', feedback);
            });
        });
    });
});

module.exports = router;
