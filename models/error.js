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
    referrer: String, // who ask for it

    trace: String, // error trace
    browser: String, // browser

    fake: Boolean,

    createdAt: {
        type: Date,
        required: true,
        index: true,
        default: (+new Date())
    }
});

var ErrorLog = mongoose.model("ErrorLog", ErrorSchema);

module.exports = {
    ErrorLog: ErrorLog
}
