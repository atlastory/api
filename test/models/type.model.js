process.env.TEST = 'true';

var expect = require('chai').expect;
var Type = require('../../models/Type');

var testId = 1,
    testName = "land",
    type;

describe('Type model', function() {
this.timeout(1000);

describe('#find()', function() {
    it('should get a single type', function(done) {
        Type.find(testId).then(function(res) {
            res = res[0];
            expect(res.id).to.equal(testId);
            expect(res.name).to.equal(testName);
        }).fin(done);
    });
});

describe('#all()', function() {
    it('should get all types', function(done) {
        Type.all().then(function(types) {
            expect(types).to.not.be.empty;
        }).fin(done);
    });
});

});
