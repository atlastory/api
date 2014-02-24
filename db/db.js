var GCR = require('grand-central-records'),
    env = process.env.ENV_VARIABLE || "development",
    database = require('./atlastory-db'),
    msc = database.mysql,
    pgc = database[env];

var verbose = (env != 'production'),
    mysql = new GCR(msc, { verbose: verbose }),
    pg    = new GCR(pgc, { verbose: verbose, idAttribute: 'id' });

exports.mysql = mysql;
exports.pg = pg;
