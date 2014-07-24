var express = require('express'),
    _ = require('lodash'),
    router = express.Router(),
    Pagination = require('../helpers/pagination'),
    Period = require('../helpers/period'),
    ErrorLog = require("../models/error").ErrorLog,
    theme = require('../public/theme.json');

router.get('/:id', function(req, res, next) {

    var id = req.params.id,
        period = req.body.period || req.query.period || 'day',
        page = +req.body.page || +req.query.page || 1,
        limit = +req.body.limit || +req.query.limit || 10,
        pages = 1,
        pagination,
        queryFilters,
        // response
        feedback;

    ErrorLog.findRichErrorById(id, function(err, errorLog) {
        if (err) {
            return next(err);
        }
        // visibility
        errorLog.hideSimilarLink = true;
        errorLog.hideDetailsLink = true;

        // response feed
        feedback = {
            title: 'Details',
            // base error history
            errors: [],
            // history filters
            period: period,
            periods: Period.mapActive(period)
        };

        var pieData = _.map(errorLog.browsersStat, function(item, i) {
            return {
                value: item.count,
                color: theme.colors[i],
                label : item.name,
            };
        });

        // json data for browsers pie chart
        errorLog.pieData = JSON.stringify(pieData);

        console.log(errorLog.trace);

        if (errorLog.trace) { // use array, block template
            errorLog.trace = errorLog.trace.split('\n').join('<br />&nbsp;&nbsp;');
        }

        console.log(errorLog.trace);

        // finalize errorLog
        feedback.errorLog = [errorLog]; // using the same partial

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

            if (pages) {
                // update controls
                pagination.navigate(page, limit, pages);
                pagination.items = _.each(pagination.navs, function(p) {
                    p.active = (p.page === page || p.page < 1 || p.page > pagination.pages);
                });
                feedback.pagination = pagination;
            }

            res.render('details', feedback);
        });

    });
});

module.exports = router;
