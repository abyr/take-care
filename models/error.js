var mongoose = require("mongoose");

var ErrorSchema = new mongoose.Schema({
    message: String,
    trace: String,
    filename: String,
    line: Number,
    symbol: Number,
    url: String
});

var Error = mongoose.model("Error", ErrorSchema);

module.exports = {
    Error: Error
}
