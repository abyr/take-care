var mongoose = require("mongoose");

var ErrorSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        index: true
    },
    trace: String,
    file: String,
    line: Number,
    symbol: Number,
    url: String,
    createdAt: {
        type: Date,
        required: true,
        index: true,
        default: (+new Date())
    }
});

var Error = mongoose.model("Error", ErrorSchema);

module.exports = {
    Error: Error
}
