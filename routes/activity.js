var express = require('express'),
    _ = require('lodash'),
    router = express.Router(),
    Period = require('../helpers/period'),
    Pagination = require('../helpers/pagination'),
    ErrorLog = require("../models/error").ErrorLog;

router.get('/', function(req, res, next) {
    var period = req.body.period || req.query.period || 'day',
        page = +req.body.page || +req.query.page || 1,
        limit = +req.body.limit || +req.query.limit || 10,
        pages = 1,
        pagination,
        queryFilters,
        // response
        feedback;

    ErrorLog.getCountForThePeriod(period, function(err, periodCount) {
        if (err) {
            return next(err);
        }

        feedback = {
            title: 'Activity',
            errors: [],
            period: period,
            periods: Period.mapActive(period)
        };

        // no activity
        if (!periodCount) {
            return res.render('activity', feedback);
        }
        pages = Math.ceil(periodCount / limit);
        if (page > pages) {
            // empty page, not existed one
            return res.render('activity', feedback);
        }

        pagination = (new Pagination(page, limit, pages)).setSort({
            createdAt: -1
        });

        queryFilters = _.pick(pagination, 'skip', 'sort', 'limit');

        // activity for the period
        ErrorLog.findRichForThePeriod(period, queryFilters, function(err, errorLogs) {
            if (err) {
                return next(err);
            }
            // activity for the period
            feedback.errors = errorLogs;

            // update controls
            pagination.items = _.each(pagination.navs, function(p) {
                p.active = (p.page === page || p.page < 1 || p.page > pagination.pages);
            });
            feedback.pagination = pagination;

            res.render('activity', feedback);
        });

    });
});

module.exports = router;
