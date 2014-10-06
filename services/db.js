var config = require('../config/config'),
    GCR = require('grand-central-records');

module.exports = {
    pg: new GCR({
        adapter: "postgres",
        host: config.database.host,
        port: config.database.port,
        database: (config.testing) ? config.database.test : config.database.database,
        username: config.database.username,
        password: config.database.password
    }, {
        verbose: config.env != 'production',
        idAttribute: 'id'
    })
};
