var app = require('../app'),
    env = app.get('env');

if (env === 'development') {
    env = '';
}

/**
 * Simple feature flags
 */
var features = require('../ff' + (env ? '.' + env : '') + '.json'),
    featureFlags = function (alias) {
        return !!features[alias];
    };

module.exports = featureFlags;
