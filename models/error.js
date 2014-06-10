var mongoose = require("mongoose"),
    Period = require('../helpers/period');

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
});

/**
 * Get how many time error was occured
 * @param  {String}   message Error message
 * @param  {Function} cb      Callback
 */
ErrorSchema.statics.getTimesCount = function(message, cb) {
    this.count({ message: message }, cb);
};

ErrorSchema.statics.findRichErrorById = function(id, cb) {
    var that = this;
    this.findById(id, function(err, rich) {
        if (err) {
            return cb(err);
        }
        // dates
        rich.datetime = Period.daytime(rich.createdAt);
        rich.ago = Period.ago(rich.createdAt);
        // times
        that.getTimesCount(rich.message, function(err, count) {
            if (count) {
                rich.occuredTimes = count;
            }
            cb(err, rich);
        });
    });
};

module.exports = {
    ErrorLog: mongoose.model("ErrorLog", ErrorSchema)
};
