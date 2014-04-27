var assert = require('assert');

process.env.ENV_VARIABLE = 'test';
var Period = require('../../models/Period');

var per = 1,
    period;

describe('Period model', function() {

describe('#find()', function() {
    this.timeout(1000);
    it('should get a single period', function(done) {
        Period.find(per, function(err, p) {
            assert.ifError(err);
            p = p[0];
            assert.equal(p.id, per);
            assert.equal(p.layer_id, 1);
            period = p;
            done();
        });
    });
});

describe('#all()', function() {
    this.timeout(1000);
    it('should get layer periods', function(done) {
        Period.all(1, function(err, periods) {
            assert.ifError(err);
            assert(periods.length > 0);
            done();
        });
    });
});

/*
describe('#getGeoJSON()', function() {
    this.timeout(0);
    it('should get geoJSON with zoom', function(done) {
        period.getGeoJSON({ z: 0 }, function(err, json) {
            assert.ifError(err);
            assert.equal(json.type, "FeatureCollection");
            assert.equal(json.features[0].type, "Feature");
            done();
        });
    });

    it('should get geoJSON with bounding box', function(done) {
        period.getGeoJSON({
            p1: [7,7],
            p2: [9,9]
        }, function(err, json) {
            assert.ifError(err);
            assert.equal(json.type, "FeatureCollection");
            assert.equal(json.features[0].type, "Feature");
            done();
        });
    });
});

describe('#getTopoJSON()', function() {
    this.timeout(0);
    it('should get topoJSON with zoom', function(done) {
        period.getTopoJSON({ z: 0 }, function(err, json) {
            assert.ifError(err);
            assert.equal(json.type, "Topology");
            assert(typeof json.bbox[0] === "number");
            done();
        });
    });

    it('should get topoJSON with bounding box', function(done) {
        period.getTopoJSON({
            p1: [7,7],
            p2: [9,9]
        }, function(err, json) {
            assert.ifError(err);
            assert.equal(json.type, "Topology");
            assert(typeof json.bbox[0] === "number");
            done();
        });
    });
});
*/

});
