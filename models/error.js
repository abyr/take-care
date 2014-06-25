/**
 * ErrorLog entity
 *
 * @module model
 */

var mongoose = require("mongoose"),
    Period = require('../helpers/period'),
    moment = require('moment'),
    async = require('async'),
    _ = require('lodash'),
    methods = {
        getBrowserShortName: function(name) {
            return (name) ? name.split(' ')[0].toLowerCase() : false;
        }
    };

/**
 * ErrorLog fields and methods
 *
 * @class ErrorSchema
 * @static
 */
var ErrorSchema = new mongoose.Schema({
    message: { // text message
        type: String,
        required: true,
        index: true
    },

    line: Number, // line number
    symbol: Number, // symbol

    file: String, // file - url
    url: String, // file-url
    referrer: String, // who asked for it

    trace: String, // error trace
    browser: String, // browser

    beforeLoad: Boolean, // before page was loaded
    fake: Boolean, // is debug error

    createdAt: {
        type: Date,
        required: true,
        index: true,
        default: (+new Date()) // cached
    }

    // datetime
    // ago
    // timesOccured
    // isChild
});

/**
 * Get how many time error was occured
 *
 * @method getTimesCount
 * @param  {String}   message Error message
 * @param  {Function} cb      Callback
 */
ErrorSchema.statics.getTimesCount = function(message, cb) {
    this.count({ message: message }, cb);
};

/**
 * Get errors count for the period
 *
 * @method getCountForThePeriod
 * @param  {String}   period Period name (day, week, etc.)
 * @param  {Function} cb     Callback
 */
ErrorSchema.statics.getCountForThePeriod = function(period, cb) {
    this.count({
        createdAt: { $gt: Period.getStartOf(period) }
    }, cb);
};

/**
 * Find errors for the period with extended fields list
 *
 * @method findRichForThePeriod
 * @param  {String}   period  Period name
 * @param  {Object}   filters Mongoose filters
 * @param  {Function} cb      Callback
 */
ErrorSchema.statics.findRichForThePeriod = function(period, filters, cb) {
    var that = this;
    this.find({
        createdAt: { $gt: Period.getStartOf(period) }
    }, null, filters, function(err, logs) {
        if (err) {
            cb(err);
        }
        async.each(logs, function(log, logCb) {
            log.ignoreBrowsers = true;
            that.addRichFields(log, logCb);
        }, function(err) {
            cb(err, logs);
        });
    });
};

/**
 * Add computed fields to the model
 *
 * @method addRichFields
 * @param {Object}   log Error item
 * @param {Function} cb  Callback
 */
ErrorSchema.statics.addRichFields = function(log, cb) {
    var that = this;
    // dates
    log.datetime = Period.daytime(log.createdAt);
    log.ago = Period.ago(log.createdAt);
    log.browserName = (log.browser) ? log.browser.split(' ')[0].toLowerCase() : false;
    if (log.isChild) {
        return cb(null, log);
    }
    // times
    this.getTimesCount(log.message, function(err, count) {
        if (count) {
            log.occuredTimes = count;
        }
        if (log.ignoreBrowsers) {
            return cb(null, log);
        }
        // browsers statistic
        that.findAllBrowsers(log, function(err, browsers) {
            // no version names
            log.browsers = _.map(browsers, methods.getBrowserShortName);
            // statistic
            log.browsersStat = [];
            async.each(browsers, function(bro, broCb) {
                that.getErrorBrowserCount(log, bro, function(err, count) {
                    log.browsersStat.push({
                        name: bro,
                        shortname: methods.getBrowserShortName(bro),
                        count: count
                    });
                    broCb(err, log);
                });
            }, function() {
                cb(err, log);
            });
        });
    });
};

/**
 * Find the Error by it's ID
 *
 * @method findRichErrorById
 * @param  {String}   id ID hash
 * @param  {Function} cb Callback
 */
ErrorSchema.statics.findRichErrorById = function(id, cb) {
    var that = this;
    this.findById(id, function(err, log) {
        if (err) {
            return cb(err);
        }
        that.addRichFields(log, cb);
    });
};

/**
 * Find errors similar to the base one
 *
 * @method findRichSimilarErrors
 * @param  {Object}   baseLog Base error log
 * @param  {Object}   filters Mongoose filters
 * @param  {Function} cb      Callback
 */
ErrorSchema.statics.findRichSimilarErrors = function(baseLog, filters, cb) {
    var that = this;
    this.find({ message: baseLog.message }, null, filters || {}, function(err, logs) {
        if (err) {
            cb(err);
        }
        async.each(logs, function(log, logCb) {
            log.isChild = true;
            that.addRichFields(log, logCb);
        }, function(err) {
            cb(err, logs);
        });
    });
};

ErrorSchema.statics.findAllBrowsers = function(baseLog, cb) {
    this.find({ message: baseLog.message }).distinct('browser', cb);
};

ErrorSchema.statics.getErrorBrowserCount = function(baseLog, browser, cb) {
    this.count({ message: baseLog.message, browser: browser }, cb);
};

/**
 * Remove errors later then passed period
 * @param  {String}   period Period name
 * @param  {Function} cb     Callback
 */
ErrorSchema.statics.removeLaterThen = function(period, cb) {
    this.find({
        createdAt: { $lt: Period.getStartOf(period) }
    }).remove(cb);
};

// todo: cache
ErrorSchema.statics.periodActivityStat = function(period, cb) {
    var label = 'MMMM Do',
        byPeriod = 'days',
        number;

    switch (period) {
        case 'day':
            label = 'h:mm a';
            number = 24;
            byPeriod = 'hours';
            break;
        case 'week':
            number = 7;
            byPeriod = 'days';
            break;
        case 'month':
            number = 28; // propper number of days in month
            byPeriod = 'days';
            break;
        case 'year':
            label = 'MMMM';
            number = 12;
            byPeriod = 'months';
            break;
        default:
            throw new Error('Unknown period ' + period);
    }

    // todo: cache
    this._periodActivityStat(period, number, byPeriod, label, cb);
};

ErrorSchema.statics._periodActivityStat = function(period, number, byPeriod, label, cb) {
    var that = this,
        start = Period.getStartOf(period),
        now = +new Date(),
        hours = _.map(_.range(number), function(i) {
            return +moment(start).add(byPeriod, i);
        }),
        result = {
            labels: _.map(hours, function(hour) {
                return moment(hour).format(label);
            }),
            datasets: [{ data: [] }]
        };

    async.eachSeries(hours, function(hour, hourCb) {
        if (hour > +moment(now).add(byPeriod, 1)) {
            return hourCb(null, 0);
        }
        that.count({
            createdAt: { '$gt': start, '$lt': hour }
        }, function(err, count) {
            start = hour;
            result.datasets[0].data.push(count);
            hourCb(err);
        });
    }, function(err) {
        cb(err, result);
    });
};

module.exports = {
    ErrorLog: mongoose.model("ErrorLog", ErrorSchema)
};
