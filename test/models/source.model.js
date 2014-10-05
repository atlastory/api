process.env.TEST = 'true';

var assert = require('assert');
var Source = require('../../models/Source');

var testId;

describe('Source model', function() {
this.timeout(1000);

describe('#create()', function() {
    it('should create a source', function(done) {
        Source.create({
            name: 'Twitter',
            source: 'twitter.com'
        }).returning('*').then(function(s) {
            s = s[0];
            assert.equal(s.name, 'Twitter');
            assert.equal(s.source, 'twitter.com');
            testId = s.id;
        }).then(done, done);
    });
});

describe('#find()', function() {
    it('should get a single source', function(done) {
        Source.find(testId).then(function(s) {
            s = s[0];
            assert.equal(s.id, testId);
            assert.equal(s.name, 'Twitter');
        }).then(done, done);
    });
});

describe('#all()', function() {
    it('should get all sources', function(done) {
        Source.all().then(function(sources) {
            assert.equal(sources[0].name, 'Atlastory Contributors');
            assert.equal(sources[1].name, 'Twitter');
        }).then(done, done);
    });
});

});
