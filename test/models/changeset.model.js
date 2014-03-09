var assert = require('assert');
var Step = require('step');
var fs = require('fs');

var Changeset = require('../../models/Changeset');

var directives = [
    {
        user_id: 4,
        action: 'add',
        object: 'shape',
        layer: 1,
        period: 1,
        shape: 53,
        type: '["Polygon","MultiPolygon"]',
        geom_diff: '[[1,2,[0,0]]]'
    },{
        user_id: 4,
        action: 'edit',
        object: 'shape',
        layer: 1,
        period: 1,
        shape: 54,
        type: '["Polygon","MultiPolygon"]',
        geom_diff: '[[1,2,[1,2]]]'
    }
];

var id, hash;

describe('Changeset model', function() {

/*
describe('#create()', function() {
    this.timeout(1000);
    it('should create changeset with multiple directives', function(done) {
        Changeset.create(directives, function(err, res) {
            assert.ifError(err);
            assert(typeof res === 'string');
            hash = res;
            done();
        });
    });
});

describe('#get()', function() {
    this.timeout(1000);
    it('should get a changeset', function(done) {
        Changeset.get(hash, function(err, res) {
            assert.ifError(err);
            assert.equal(res.length, directives.length);
            assert.equal(res[0].shape, 53);
            assert.equal(res[1].shape, 54);

            var diff = JSON.parse(res[0].geom_diff);
            assert.equal(diff[0][0], 1);

            var type = JSON.parse(res[0].type);
            assert.equal(type[0], 'Polygon');
            done();
        });
    });
});
*/

});
