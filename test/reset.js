process.env.TEST = 'true';

var path = require('path');
var fs = require('fs');
var Q = require('q');
var pg = require('../services/db').pg;

var readFile = Q.denodeify(fs.readFile);

describe('reset', function() {
    it('should reset the database', function(done) {
        readFile(path.resolve('./db/structure.sql'))
        .then(function(sql) { return pg.query(sql+''); })
        .then(function() { return readFile(path.resolve('./db/seeds.sql')); })
        .then(function(sql) { pg.query(sql+''); })
        .then(done, done);
    });
});
