/**
 * ErrorLog entity
 *
 * @module model
 */

var mongoose = require("mongoose"),
    Period = require('../helpers/period'),
    async = require('async'),
    _ = require('lodash');

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
        that.findAllBrowsers(log, function(err, browsers) {
            log.browsers = _.map(browsers, function(browser) {
                return (browser) ? browser.split(' ')[0].toLowerCase() : false;
            });
            cb(err, log);
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

module.exports = {
    ErrorLog: mongoose.model("ErrorLog", ErrorSchema)
};
