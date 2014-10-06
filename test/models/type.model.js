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
        }).then(done,done);
    });
});

describe('#all()', function() {
    it('should get all types', function(done) {
        Type.all().then(function(types) {
            expect(types).to.not.be.empty;
        }).then(done,done);
    });
});

describe('#getFromTypeOrLevel()', function() {
    it('should get types from type or level name', function(done) {
        Type.getFromTypeOrLevel(testName).then(function(types) {
            expect(types[0].name).to.equal(testName);
            expect(types[0].level).to.equal('land');
        }).then(done,done);
    });
});

});
