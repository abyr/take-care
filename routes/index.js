var path = require('path'),
    routes = {
        api: require(path.join(__dirname, 'api')),

        index: require(path.join(__dirname, 'login')),

        login: require(path.join(__dirname, 'login')),
        activity: require(path.join(__dirname, 'activity')),
        details: require(path.join(__dirname, 'details')),
        stats: require(path.join(__dirname, 'stats')),
        tools: require(path.join(__dirname, 'tools'))
    };

module.exports = routes;