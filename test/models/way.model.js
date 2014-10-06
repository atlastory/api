var assert = require('assert');

process.env.TEST = 'true';
var Way = require('../../models/Way');

var wayId, node1, node2;

var coords = [[1.234, 5.678],[2.345, 6.789],[3.456, 7.891],[4.567, 8.9101]];

describe('Way model', function() {
this.timeout(4000);

describe('#create()', function() {
    it('should create a Way with nodes', function(done) {
        Way.create(coords, { created_at: new Date(), error: 5 })
        .then(function(nodes) {
            assert(typeof nodes[0].way_id === 'string');
            wayId = nodes[0].way_id;
        }).then(done, done);
    });
});

describe('#getNodes()', function() {
    it('should get nodes from way', function(done) {
        Way.getNodes(wayId).then(function(nodes) {
            assert.equal(nodes[0].longitude, coords[0][0]);
            assert.equal(nodes[3].longitude, coords[3][0]);
        }).then(done, done);
    });
});

describe('#find()', function() {
    it('should find a way with way_nodes', function(done) {
        Way.find(wayId).then(function(n) {
            assert.equal(n[0].id, wayId);
            return Way.getNodes(wayId);
        }).then(function(nodes) {
            assert.equal(nodes[0].longitude, coords[0][0]);
            assert.equal(nodes[2].longitude, coords[2][0]);
        }).then(done, done);
    });
});

describe('#addNodes()', function() {
    it('should add new nodes to way', function(done) {
        Way.addNodes(wayId, 1, [
            { longitude: 5, latitude: -3 },
            { longitude: 4, latitude: -2 }
        ]).then(function(wayNodes) {
            return Way.getNodes(wayId);
        }).then(function(nodes) {
            node1 = nodes[1].id;
            node2 = nodes[2].id;
            assert.equal(nodes[1].latitude, -3);
            assert.equal(nodes[2].latitude, -2);
        }).then(done, done);
    });
});

describe('#removeNodes()', function() {
    it('should remove nodes from way', function(done) {
        Way.removeNodes(wayId, [node1, node2])
        .then(function(wayNodes) {
            return Way.getNodes(wayId);
        }).then(function(nodes) {
            assert.equal(nodes.length, coords.length);
            assert.equal(nodes[1].latitude, coords[1][1]);
        }).then(done, done);
    });
});

});
