var mongoose = require("mongoose");

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
});

/**
 * Get how many time error was occured
 * @param  {String}   message Error message
 * @param  {Function} cb      Callback
 */
ErrorSchema.statics.getTimesCount = function(message, cb) {
    this.count({ message: message }, cb);
};

module.exports = {
    ErrorLog: mongoose.model("ErrorLog", ErrorSchema)
};
