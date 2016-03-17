var user = process.env.MNGUSER || '',
    pass = process.env.MNGPASS || '',
    host = process.env.MNGHOST || '',
    admin_email = process.env.ADMIN_EMAIL || '',
    admin_pass = process.env.ADMIN_PASS || '',
    config = {
        app: {
            port: 3000
        },
        db: {
            connection: 'mongodb://' + user + ':' + pass + '@' + host
        },
        admin: {
            email: admin_email,
            pass: admin_pass
        }
    };

module.exports = config;
