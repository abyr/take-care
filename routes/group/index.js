var express = require('express'),
    async = require('async'),
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
        limit = +req.body.limit || +req.query.limit || 1,
        pages = 1,
        pagination,
        // db
        query,
        queryFilters,
        // response
        feedback;

    async.series({
        errorLog: function(callback) {
            ErrorLog.findById(id, function(err, error) {
                // error
                if (err) return callback(err);
                // success
                callback(null, error);
            });
        }
    }, function(err, results) {
        // error
        if (err) return next(err);

        // response feed
        feedback = {
            title: 'Error Group :: Take Care',
            errors: [],
            period: period,
            periods: Period.mapActive(period),
            error: results.errorLog,
            message: results.errorLog.message
        };

        // empty
        if (!results.count) {
            return res.render('group', feedback);
        }

        pages = Math.ceil(results.count / limit);

        // 404
        if (page > pages) {
            return next({ status: 404, message: 'Page not found' });
        }

        pagination = (new Pagination(page, limit, pages)).setSort({
            createdAt: -1
        });


        // skip as filter
        pagination.skip = pagination.limit * (page - 1);

        query = {
            message: results.errorLog.message
        };
        queryFilters = _.pick(pagination, 'skip', 'sort', 'limit')

        ErrorLog.find(query, null, queryFilters, function(err, errorLogs) {
            // error
            if (err) return next(err);

            async.each(errorLogs, function(errorLog, callback) {
                errorLog.datetime = Period.daytime(errorLog.createdAt);
                errorLog.ago = Period.ago(errorLog.createdAt);

                ErrorLog.count({
                    message: errorLog.message
                }, function(err, count) {
                    // error
                    if (err) return callback(err);

                    errorLog.occuredTimes = count;
                    callback(null, errorLog);
                });

            }, function(err, results) {
                // error
                if (err) return next(err);

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
