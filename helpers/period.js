var period = {},
    moment = require('moment');

// the period ('day', 'week', 'month', etc.

// get first date (ts) of the period ('day', 'month', etc.)
period.getStartOf = function(period) {
    return +moment().startOf(period);
}

period.datetime = function(date) {
    return moment(date).format('MMMM Do YYYY, h:mm:ss a');
}

period.daytime = function(date) {
    return moment(date).calendar();
}

period.ago = function(date) {
    return moment(date).fromNow();
}

module.exports = period;
