var express = require('express'),
    async = require('async'),
    _ = require('lodash'),
    router = express.Router(),
    ff = require('../helpers/ff'),
    Period = require('../helpers/period'),
    Pagination = require('../helpers/pagination'),
    ErrorLog = require("../models/error").ErrorLog;

router.get('/', function(req, res, next) {
    var period = req.body.period || req.query.period || 'day',
        page = +req.body.page || +req.query.page || 1,
        limit = +req.body.limit || +req.query.limit || 10,
        pages = 1,
        pagination,
        // db
        query = {
            createdAt: {
                $gt: Period.getStartOf(period)
            }
        },
        queryFilters,
        // response
        feedback;

    async.series({
        count: function(callback) {
            ErrorLog.count(query, function(err, count) {
                if (err) {
                    return callback(err);
                }
                callback(null, count);
            });
        }

    }, function(err, results) {
        // error
        if (err) {
            return next(err);
        }

        feedback = {
            title: 'Activity',
            errors: [],
            period: period,
            periods: Period.mapActive(period)
        };

        feedback.partials = {
            error: 'blocks/error',
            pagination: 'blocks/pagination',
            'pagination-script': 'blocks/pagination-script',
            filters: 'blocks/filters',
        };

        // empty
        if (!results.count) {
            return res.render('activity', feedback);
        }

        pages = Math.ceil(results.count / limit);
        // 404
        if (page > pages) {
            return res.render('activity', feedback);
        }

        pagination = (new Pagination(page, limit, pages)).setSort({
            createdAt: -1
        });

        queryFilters = _.pick(pagination, 'skip', 'sort', 'limit');

        ErrorLog.find(query, null, queryFilters, function(err, errorLogs) {
            // error
            if (err) {
                return next(err);
            }

            async.each(errorLogs, function(errorLog, callback) {
                errorLog.datetime = Period.daytime(errorLog.createdAt);
                errorLog.ago = Period.ago(errorLog.createdAt);

                // times
                ErrorLog.deferreds.times(errorLog.message, function(err, times) {
                    // error
                    if (err) {
                        return next(err);
                    }
                    errorLog.occuredTimes = times;
                    callback(null, errorLog);
                });

            }, function(err) {
                // error
                if (err) {
                    return next(err);
                }
                if (ff('pagination')) {
                    pagination.items = _.each(pagination.navs, function(p) {
                        p.active = (p.page === page || p.page < 1 || p.page > pagination.pages);
                    });
                    feedback.pagination = pagination;
                }

                feedback.errors = errorLogs;

                res.render('activity', feedback);
            });
        });
    });
});

module.exports = router;
