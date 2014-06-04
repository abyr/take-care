var features = require('../ff.json'),
    featureFlags = function(alias, options) {
        return !!features[alias];
    }

module.exports = featureFlags;
