var assert = require('assert');

process.env.ENV_VARIABLE = 'test';
var Way = require('../../models/Way');

var wayId;

var coords = [[1, 1],[2, 2],[3, 3],[4, 4]];

describe('Way model', function() {
this.timeout(4000);

describe('#create()', function() {
    it('should create a Way with nodes', function(done) {
        Way.create(coords, { created_at: new Date(), error: 5 }, function(err, nodes) {
            assert.ifError(err);
            assert(typeof nodes[0].way_id === 'number');
            wayId = nodes[0].way_id;
            done();
        });
    });
});

describe('#getNodes()', function() {
    it('should get nodes from way', function(done) {
        Way.getNodes(wayId, function(err, nodes) {
            assert.ifError(err);
            assert.equal(nodes[0].longitude, coords[0][0]);
            assert.equal(nodes[3].longitude, coords[3][0]);
            done();
        });
    });
});

describe('#find()', function() {
    it('should find a way with way_nodes', function(done) {
        Way.find(wayId, function(err, n) {
            assert.ifError(err);
            assert.equal(n[0].id, wayId);
            Way.getNodes(wayId, function(err, nodes) {
                assert.ifError(err);
                assert.equal(nodes[0].longitude, 1);
                assert.equal(nodes[2].longitude, 3);
                done();
            });
        });
    });
});

describe('#addNodes()', function() {
    it('should add new nodes to way', function(done) {
        Way.addNodes(wayId, 1, [
            { longitude: 5, latitude: -3 },
            { longitude: 4, latitude: -2 }
        ]).run().then(function(sequence) {
            return Way.getNodes(wayId).run();
        }).then(function(nodes) {
            assert.equal(nodes[1].latitude, -3);
            assert.equal(nodes[2].latitude, -2);
        }).then(done)
        .fail(function(err) {
            assert.ifError(err);
        });
    });
});

});
