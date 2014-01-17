var assert = require('assert');
var Step = require('step');
var fs = require('fs');

var Shape = require('../../models/Shape');

var per = 1, shp = 1;

describe('Shape model', function() {

describe('#find()', function() {
    this.timeout(0);
    it('should fail with no id or pid', function() {
        Shape.find(null, null, function(err) {
            assert.throws(function(){throw err;}, Error);
        });
    });

    it('should get a shape as geoJSON', function(done) {
        Shape.find(per, shp, function(err, json) {
            assert.ifError(err);
            assert.equal(json.type, "FeatureCollection");
            assert.equal(json.features[0].properties.gid, shp);
            done();
        });
    });

    it('should get a shape as JSON', function(done) {
        Shape.find(per, shp, 'json', function(err, json) {
            assert.ifError(err);
            assert.equal(json.period, 1);
            assert.equal(typeof json.tags, "object");
            done();
        });
    });
});

});
