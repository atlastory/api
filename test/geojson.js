process.env.ENV_VARIABLE = 'test';

var assert = require('assert');

var geojson = require('../lib/geojson'),
    Shape = require('../models/Shape');

var testSimple = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "poly", "a": 2.88 },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[20.1, 20.1], [16.9, 16.9], [10, 10], [20.1, 20.1]]]
            }
        }
    ]
};

assert.checkNodes = function(geojson, hash, done) {
    var prop = geojson.features[0].properties,
        geom = geojson.features[0].geometry,
        coords = geom.coordinates;

    Shape.getNodes({ changeset: hash }, function(err,nodes) {
        assert.ifError(err);
        switch (geom.type) {
        case "Point":
            assert.equal(coords[0], nodes[0].lon);
            break;
        case "LineString":
        case "MultiPoint":
            assert.equal(coords[0][0], nodes[0].lon);
            assert.equal(coords[1][1], nodes[1].lat);
            break;
        case "Polygon":
        case "MultiLineString":
            assert.equal(coords[0][0][0], nodes[0].lon);
            assert.equal(coords[0][2][1], nodes[2].lat);
            break;
        case "MultiPolygon":
            assert.equal(coords[0][0][0][0], nodes[0].lon);
            assert.equal(coords[0][0][2][1], nodes[2].lat);
            break;
        }
        done();
    });
};

describe('GeoJSON', function() {

describe('#import()', function() {
    this.timeout(6000);
    it('should import a GeoJSON', function(done) {
        geojson.import({
            geojson: testSimple,
            period: 1, user: 1, type: 1
        }, function(err, hash) {
            assert.ifError(err);
            assert.checkNodes(testSimple, hash, done);
        });
    });

    it('shouldn\'t duplicate an existing shape', function(done) {
        geojson.import({
            geojson: testSimple,
            period: 2, user: 1, type: 1,
            duplicate: false
        }, function(err, hash) {
            assert.ifError(err);
            assert.checkNodes(testSimple, hash, done);
        });
    });

    // it('should share existing nodes');

    // it('should fail if GeoJSON isn\'t valid');
});

// #export()

});
