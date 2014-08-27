process.env.TEST = 'true';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var config = require('../config/config');
var pg = require('../services/db').pg;


describe('reset', function() {
    it('should reset the database', function(done) {
        fs.readFile(path.resolve('./db/postgres.sql'), function(err, sql) {
            if (err) throw err;
            pg.query(sql+'', done);
        });
    });
});
