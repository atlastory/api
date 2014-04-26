process.env.ENV_VARIABLE = 'test';

var assert = require('assert');

var geojson = require('../lib/geojson'),
    Shape = require('../models/Shape');

var point = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "line", "a": "b" },
            "geometry": {
                "type": "Point",
                "coordinates": [0.5212, 4.1789]
            }
        }
    ]
};

var line = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "line", "a": "b" },
            "geometry": {
                "type": "LineString",
                "coordinates": [[1,1], [2,2], [3,3], [4,4], [10,10]]
            }
        }
    ]
};

var polygon = {
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

var multiPolygon = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "multi poly", "a": 55 },
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [[[[6.6,6.6],[7.7,7.7],[6.6,2.2],[6.6,6.6]], [[1.1, 1.1],[2.2,2.2],[2.2,0.54321],[1.1,1.1]]],[[[6.6,6.6],[7.7,7.7],[7.7,2],[6.6,6.6]]]]
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

    it('should import a point', function(done) {
        geojson.import({
            geojson: point,
            period: 1, user: 1, type: 1
        }, function(err, hash) {
            assert.ifError(err);
            assert.checkNodes(point, hash, done);
        });
    });

    it('should import a line', function(done) {
        geojson.import({
            geojson: line,
            period: 1, user: 1, type: 1
        }, function(err, hash) {
            assert.ifError(err);
            assert.checkNodes(line, hash, done);
        });
    });

    it('should import a polygon', function(done) {
        geojson.import({
            geojson: polygon,
            period: 1, user: 1, type: 1
        }, function(err, hash) {
            assert.ifError(err);
            assert.checkNodes(polygon, hash, done);
        });
    });

    it('should import a multipolygon', function(done) {
        geojson.import({
            geojson: multiPolygon,
            period: 1, user: 1, type: 1
        }, function(err, hash) {
            assert.ifError(err);
            assert.checkNodes(multiPolygon, hash, done);
        });
    });

    it('shouldn\'t duplicate an existing shape', function(done) {
        geojson.import({
            geojson: polygon,
            period: 2, user: 1, type: 1,
            duplicate: false
        }, function(err, hash) {
            assert.ifError(err);
            assert.checkNodes(polygon, hash, done);
        });
    });

    // TODO: it('should import correct data');

    // TODO: it('should import polygon roles');

    // TODO: it('should share existing nodes');

    // TODO: it('should fail if GeoJSON isn\'t valid');
});

// #export()

});
