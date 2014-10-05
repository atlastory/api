var assert = require('assert');

process.env.TEST = 'true';
var Node = require('../../models/Node');

var node;

describe('Node model', function() {

describe('#create()', function() {
    it('should create a node in database', function(done) {
        Node.create([8.88, 8.88], { tile: 12, error: 2 })
        .then(function(nodes) {
            assert(typeof nodes[0].id === 'string');
            node = nodes[0].id;
        }).then(done, done);
    });

    it('should create multiple nodes', function(done) {
        Node.create([[8.88, 8.88],[7.77, 7.86]])
        .then(function(nodes) {
            assert(typeof nodes[0].id === 'string');
            assert(typeof nodes[1].id === 'string');
        }).then(done, done);
    });
});

describe('#find()', function() {
    it('should find a node', function(done) {
        Node.find(node).then(function(n) {
            n = n[0];
            assert.equal(n.longitude, 8.88);
            assert.equal(n.latitude, 8.88);
        }).then(done, done);
    });
});

describe('#update()', function() {
    it('should update an existing node', function(done) {
        Node.update(node, { longitude: 4.44 })
        .then(function(n) {
            return Node.find(node);
        }).then(function(n) {
            assert.equal(n[0].longitude, 4.44);
        }).then(done, done);
    });
});

});
