var user = process.env.MNGUSER || '',
    pass = process.env.MNGPASS || '',
    host = process.env.MNGHOST || '',
    config = {
        app: {
            port: 3000
        },
        db: {
            connection: 'mongodb://' + user + ':' + pass + '@' + host
        }
    };

module.exports = config;
