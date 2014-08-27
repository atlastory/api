process.env.TEST = 'true';

var assert = require('assert');
var Source = require('../../models/Source');

var testId;

describe('Source model', function() {

describe('#create()', function() {
    this.timeout(1000);
    it('should create a source', function(done) {
        Source.create({
            name: 'Twitter',
            source: 'twitter.com'
        }).returning('*', function(err, s) {
            assert.ifError(err);
            s = s[0];
            assert.equal(s.name, 'Twitter');
            assert.equal(s.source, 'twitter.com');
            testId = s.id;
            done();
        });
    });
});

describe('#find()', function() {
    this.timeout(1000);
    it('should get a single source', function(done) {
        Source.find(testId, function(err, s) {
            assert.ifError(err);
            s = s[0];
            assert.equal(s.id, testId);
            assert.equal(s.name, 'Twitter');
            done();
        });
    });
});

describe('#all()', function() {
    this.timeout(1000);
    it('should get all sources', function(done) {
        Source.all(function(err, sources) {
            assert.ifError(err);
            assert.equal(sources[0].name, 'Atlastory Contributors');
            assert.equal(sources[1].name, 'Twitter');
            done();
        });
    });
});

});
