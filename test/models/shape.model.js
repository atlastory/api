var assert = require('assert');

process.env.ENV_VARIABLE = 'test';
var Shape = require('../../models/Shape');

var shape;

describe('Shape model', function() {

describe('#create()', function() {
    it('should create a Shape with nodes', function(done) {
        Shape.create({
            period_id: 1,
            name: 'Test',
            day_end: '1492-01-01',
            tags: [12],
            country: 'Spain'
        }, function(err, id) {
            assert.ifError(err);
            assert(typeof id === 'number');
            shape = id;
            done();
        });
    });
});

describe('#find()', function() {
    it('should find a Shape', function(done) {
        Shape.find(shape, function(err, s) {
            assert.ifError(err);
            s = s[0];
            assert.equal(s.name, 'Test');
            assert.equal(s.tags[0], 12);
            assert.equal(s.data.country, 'Spain');
            done();
        });
    });
});

describe('#connect()', function() {
    it('should connect a Shape to nodes/ways', function(done) {
        Shape.connect(shape, {
            nodes: [1, 2],
            ways: [1],
            shapes: []
        }, function(err) {
            assert.ifError(err);
            done();
        });
    });
});

describe('#get()', function() {
    it('should get a shape with nodes/ways', function(done) {
        Shape.get(shape, function(err, s) {
            assert.ifError(err);
            assert.equal(s.properties.day_end, '1492-01-01');
            assert.equal(s.features[0].type, 'Node');
            done();
        });
    });
});


});
