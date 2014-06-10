var mongoose = require("mongoose"),
    Period = require('../helpers/period'),
    async = require('async');

/**
 * ErrorLog schema
 * @type {mongoose}
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
 * @param  {String}   message Error message
 * @param  {Function} cb      Callback
 */
ErrorSchema.statics.getTimesCount = function(message, cb) {
    this.count({ message: message }, cb);
};

ErrorSchema.statics.getCountForThePeriod = function(period, cb) {
    this.count({
        createdAt: { $gt: Period.getStartOf(period) }
    }, cb);
};

ErrorSchema.statics.findRichForThePeriod = function(period, filters, cb) {
    var that = this;
    this.find({
        createdAt: { $gt: Period.getStartOf(period) }
    }, null, filters, function(err, logs) {
        if (err) {
            cb(err);
        }
        async.each(logs, function(log, logCb) {
            that.addRichFields(log, logCb);
        }, function(err) {
            cb(err, logs);
        });
    });
};

ErrorSchema.statics.addRichFields = function(log, cb) {
    // dates
    log.datetime = Period.daytime(log.createdAt);
    log.ago = Period.ago(log.createdAt);
    if (log.isChild) {
        return cb(null, log);
    }
    // times
    this.getTimesCount(log.message, function(err, count) {
        if (count) {
            log.occuredTimes = count;
        }
        cb(err, log);
    });
};

ErrorSchema.statics.findRichErrorById = function(id, cb) {
    var that = this;
    this.findById(id, function(err, log) {
        if (err) {
            return cb(err);
        }
        that.addRichFields(log, cb);
    });
};

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

module.exports = {
    ErrorLog: mongoose.model("ErrorLog", ErrorSchema)
};
