process.env.ENV_VARIABLE = 'test';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var pg = require('../db/db').pg;


describe('reset', function() {
    it('should reset the database', function(done) {
        fs.readFile(path.resolve('./db/postgres.sql'), function(err, sql) {
            if (err) throw err;
            pg.query(sql+'', done);
        });
    });
});
