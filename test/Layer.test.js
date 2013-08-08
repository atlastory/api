var assert = require('assert');
var Step = require('step');
var fs = require('fs');

var Layer = require('../models/Layer');

var lyr = 64, lName = "places";

describe('Layer model', function() {

describe('#find()', function() {
    this.timeout(1000);
    it('should get a single layer', function(done) {
        Layer.find(lyr, function(err, layer) {
            assert.ifError(err);
            assert.equal(layer.id, lyr);
            assert.equal(layer.table, lName+'_'+lyr);
            done();
        });
    });
});

describe('#all()', function() {
    this.timeout(1000);
    it('should get map layers', function(done) {
        Layer.all(1, function(err, layers) {
            assert.ifError(err);
            assert(layers.length > 0);
            done();
        });
    });
});

describe('#getGeoJSON()', function() {
    this.timeout(0);
    it('should fail with no id or pid', function() {
        Layer.getGeoJSON({}, function(err) {
            assert.throws(function(){throw err;}, Error);
        });
    });

    it('should get geoJSON with zoom', function(done) {
        Layer.getGeoJSON({
            id: lyr, pid: 1, z: 0
        }, function(err, json) {
            assert.ifError(err);
            assert.equal(json.type, "FeatureCollection");
            assert.equal(json.features[0].type, "Feature");
            done();
        });
    });

    it('should get geoJSON with bounding box', function(done) {
        Layer.getGeoJSON({
            id: lyr, pid: 1,
            p1: [-13.711,32.842],
            p2: [37.969,58.263]
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
        Layer.getTopoJSON({
            id: lyr, pid: 1, z: 0
        }, function(err, json) {
            assert.ifError(err);
            assert.equal(json.type, "Topology");
            assert(typeof json.bbox[0] === "number");
            done();
        });
    });

    it('should get topoJSON with bounding box', function(done) {
        Layer.getTopoJSON({
            id: lyr, pid: 1,
            p1: [-13.711,32.842],
            p2: [37.969,58.263]
        }, function(err, json) {
            assert.ifError(err);
            assert.equal(json.type, "Topology");
            assert(typeof json.bbox[0] === "number");
            done();
        });
    });
});

});
