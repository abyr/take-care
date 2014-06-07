var express = require('express'),
    async = require('async'),
    moment = require('moment'),
    _ = require('lodash'),
    router = express.Router(),
    ff = require('../../helpers/featureFlags'),
    Pagination = require('../../helpers/pagination'),
    Period = require('../../helpers/period'),
    ErrorLog = require("../../models/error").ErrorLog;

router.get('/:id', function(req, res, next) {

    // FIXME: duplicated code

    var id = req.params.id,
        period = req.body.period || req.query.period || 'day',
        page = +req.body.page || +req.query.page || 1,
        pages,
        filters,
        pagination,
        periods = ['day', 'week', 'month', 'year'],
        feedback;

    async.series({
        errorLog: function(callback) {
            ErrorLog.findById(id, function(err, error) {
                if (err) {
                    return res.render('error', err);
                }
                callback(null, error);
            });
        }
    }, function(err, results) {
        if (err) {
            return res.render('error', err);
        }

        feedback = {
            title: 'Error Group :: Take Care',
            errors: [],
            period: period,
            periods: _.map(periods, function(p) {
                return {
                    title: p,
                    active: (p === period)
                }
            }),
            error: results.errorLog,
            message: results.errorLog.message
        };

        filters = {
            message: results.errorLog.message
        };

        // not found
        if (!results.count) {
            return res.render('group', feedback);
        }

        pages = Math.ceil(results.count / pagination.limit);
        if (page > pages) {
            feedback.title = 'Page not found';
            if (err) {
                return res.render('error', err);
            }
        }

        pagination = (new Pagination(page, limit, pages)).setSort({
            createdAt: -1
        });

        // skip as filter
        pagination.skip = pagination.limit * (page - 1);

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

                feedback.pagination = pagination;
                feedback.errors = errorLogs;

                res.render('group', feedback);
            });
        });

    });

});

module.exports = router;
