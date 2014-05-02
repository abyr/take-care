var mongoose = require("mongoose");

var ErrorSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        index: true
    },

    line: Number,
    symbol: Number,

    file: String,
    url: String,
    referrer: String,

    trace: String,
    browser: String,

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
