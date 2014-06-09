var mongoose = require("mongoose");

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

var ErrorLog = mongoose.model("ErrorLog", ErrorSchema),
    deferreds = {

        // TODO: use deferred instead of callback

        times: function(message, callback) {
            ErrorLog.count({
                message: message
            }, function(err, count) {
                // error
                if (err) {
                    return callback(err);
                }
                callback(null, count);
            });
        }
    };

ErrorLog.deferreds = deferreds;

module.exports = {
    ErrorLog: ErrorLog
};
