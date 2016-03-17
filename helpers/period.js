var period = {},
    _ = require('lodash'),
    moment = require('moment');

period.periods = ['day', 'week', 'month', 'year'];

// get first date (ts) of the period ('day', 'month', etc.)
period.getStartOf = function (period) {
    return +moment().startOf(period);
};

// iso
period.datetime = function (date) {
    return moment(date).format('MMMM Do YYYY, h:mm:ss a');
};

// weekday name and time
period.daytime = function (date) {
    return moment(date).calendar();
};

// xx time ago
period.ago = function (date) {
    return moment(date).fromNow();
};

// periods : title, active
period.mapActive = function (period) {
    return _.map(this.periods, function (p) {
        return {
            title: p,
            active: (p === period)
        };
    });
};

module.exports = period;
