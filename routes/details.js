var express = require('express'),
    async = require('async'),
    _ = require('lodash'),
    router = express.Router(),
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
        queryFilters,
        errorLog,
        // response
        feedback;

    async.series({
        errorLog: function(cb) {
            ErrorLog.findRichErrorById(id, function(err, richErrorLog) {
                cb(err, richErrorLog);
            });
        }
    }, function(err, results) {
        // error
        if (err) {
            return next(err);
        }

        // base error
        errorLog = results.errorLog;

        // visibility
        errorLog.hideSimilarLink = true;

        // response feed
        feedback = {
            title: 'Details',
            // base error
            errorLog: [errorLog], // use single partial
            // base error history
            errors: [],
            // history filters
            period: period,
            periods: Period.mapActive(period),
            // TODO: share partials
            partials: {
                error: 'blocks/error',
                pagination: 'blocks/pagination',
                'pagination-script': 'blocks/pagination-script',
                filters: 'blocks/filters'
            }
        };

        pagination = (new Pagination(page, limit, pages)).setSort({
            createdAt: -1
        });

        queryFilters = _.pick(pagination, 'skip', 'sort', 'limit');

        // get history
        ErrorLog.findRichSimilarErrors(errorLog, queryFilters, function(err, logs) {
            if (err) {
                return next(err);
            }
            pages = Math.ceil(errorLog.occuredTimes / limit);
            if (page > pages) {
                // empty history page, it doesn't exists
                return res.render('details', feedback);
            }
            // base error history
            feedback.errors = logs;

            // update controls
            pagination.navigate(page, limit, pages);
            pagination.items = _.each(pagination.navs, function(p) {
                p.active = (p.page === page || p.page < 1 || p.page > pagination.pages);
            });
            feedback.pagination = pagination;

            res.render('details', feedback);
        });

    });
});

module.exports = router;
