var period = {},
    moment = require('moment');

// the period ('day', 'week', 'month', etc.

// get first date (ts) of the period ('day', 'month', etc.)
period.getStartOf = function(period) {
    return +moment().startOf(period);
}

// iso
period.datetime = function(date) {
    return moment(date).format('MMMM Do YYYY, h:mm:ss a');
}

// weekday name and time
period.daytime = function(date) {
    return moment(date).calendar();
}

// xx time ago
period.ago = function(date) {
    return moment(date).fromNow();
}

module.exports = period;
