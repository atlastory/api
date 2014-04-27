var assert = require('assert');

process.env.ENV_VARIABLE = 'test';
var Type = require('../../models/Type');

var testId = 1,
    testName = "Land",
    type;

describe('Type model', function() {

describe('#find()', function() {
    this.timeout(1000);
    it('should get a single type', function(done) {
        Type.find(testId, function(err, t) {
            assert.ifError(err);
            t = t[0];
            assert.equal(t.id, testId);
            assert.equal(t.name, testName);
            type = t;
            done();
        });
    });
});

describe('#all()', function() {
    this.timeout(1000);
    it('should get all types', function(done) {
        Type.all(function(err, types) {
            assert.ifError(err);
            assert(types.length > 0);
            done();
        });
    });
});

});
