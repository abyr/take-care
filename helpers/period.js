var period = {},
    moment = require('moment');

// the period ('day', 'week', 'month', etc.

// get first date (ts) of the period ('day', 'month', etc.)
period.getStartOf = function(period) {
    return +moment().startOf(period);
}

module.exports = period;
