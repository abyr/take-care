/**
 * List of routes
 */

var path = require('path'),
    routes = {
        activity: require(path.join(__dirname, 'activity')),
        details: require(path.join(__dirname, 'details')),
        tools: require(path.join(__dirname, 'tools')),
        api: require(path.join(__dirname, 'api'))
    };

module.exports = routes;