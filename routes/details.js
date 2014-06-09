var express = require('express'),
    async = require('async'),
    _ = require('lodash'),
    router = express.Router(),
    ff = require('../helpers/ff'),
    Pagination = require('../helpers/pagination'),
    Period = require('../helpers/period'),
    ErrorLog = require("../models/error").ErrorLog;

router.get('/:id', function(req, res, next) {

    // FIXME: duplicated code

    var id = req.params.id,
        period = req.body.period || req.query.period || 'day',
        page = +req.body.page || +req.query.page || 1,
        limit = +req.body.limit || +req.query.limit || 10,
        pages = 1,
        pagination,
        // db
        query,
        queryFilters,
        errorLog,
        // response
        feedback;

    async.series({
        errorLog: function(callback) {
            ErrorLog.findById(id, function(err, errorLog) {
                if (err) {
                    return callback(err);
                }
                // dates
                errorLog.datetime = Period.daytime(errorLog.createdAt);
                errorLog.ago = Period.ago(errorLog.createdAt);
                // occured times count
                ErrorLog.getTimesCount(errorLog.message, function(err, count) {
                    if (err) {
                        return callback(err);
                    }
                    errorLog.occuredTimes = count;
                    callback(null, errorLog);
                });

            });
        }
    }, function(err, results) {
        // error
        if (err) {
            return next(err);
        }

        errorLog = results.errorLog;
        // visibility
        errorLog.hideSimilarLink = true;

        // response feed
        feedback = {
            title: 'Details',
            errors: [],
            period: period,
            periods: Period.mapActive(period)
        };

        feedback.partials = {
            error: 'blocks/error',
            pagination: 'blocks/pagination',
            'pagination-script': 'blocks/pagination-script',
            filters: 'blocks/filters'
        };

        pagination = (new Pagination(page, limit, pages)).setSort({
            createdAt: -1
        });
        query = {
            message: results.errorLog.message
        };
        queryFilters = _.pick(pagination, 'skip', 'sort', 'limit');

        ErrorLog.find(query, null, queryFilters, function(err, errorLogs) {
            // error
            if (err) {
                return next(err);
            }
            async.each(errorLogs, function(errorLog, callback) {
                errorLog.isChild = true;
                errorLog.hideDetailsLink = true;
                errorLog.datetime = Period.daytime(errorLog.createdAt);
                errorLog.ago = Period.ago(errorLog.createdAt);

                callback(null, errorLog);

            }, function(err) {
                // error
                if (err) {
                    return next(err);
                }

                pages = Math.ceil(errorLog.occuredTimes / limit);
                // 404
                if (page > pages) {
                    return res.render('details', feedback);
                }

                pagination.navigate(page, limit, pages);

                if (ff('pagination')) {
                    pagination.items = _.each(pagination.navs, function(p) {
                        p.active = (p.page === page || p.page < 1 || p.page > pagination.pages);
                    });
                    feedback.pagination = pagination;
                }

                feedback.pagination = pagination;
                feedback.errors = errorLogs;
                feedback.errorLog = [errorLog];

                res.render('details', feedback);
            });
        });
    });
});

module.exports = router;
