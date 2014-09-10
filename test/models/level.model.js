process.env.TEST = 'true';

var expect = require('chai').expect;
var Level = require('../../models/Level');

var testId = 1,
    testName = "land",
    level;

describe('Level model', function() {
this.timeout(1000);

describe('#find()', function() {
    it('should get a single level', function(done) {
        Level.find(testId).then(function(res) {
            res = res[0];
            expect(res.id).to.equal(testId);
            expect(res.name).to.equal(testName);
        }).fin(done);
    });
});

describe('#all()', function() {
    it('should get all levels', function(done) {
        Level.all().then(function(levels) {
            expect(levels).to.not.be.empty;
        }).fin(done);
    });
});

});
