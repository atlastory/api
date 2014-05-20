process.env.ENV_VARIABLE = 'test';

var assert = require('assert');
var expect = require('chai').expect;

var geojson = require('../lib/geojson'),
    Shape = require('../models/Shape');

var invalid = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "line", "a": "b" },
            "geometry": {
                "type": "Point",
                "coordinates": [[[0.5212, 4.1789]]]
            }
        }
    ]
};

var point = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "line", "a": "b", "type": "Country", "ABBREV": "ln" },
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

assert.checkNodes = function(geojson, cs, done) {
    var prop = geojson.features[0].properties,
        geom = geojson.features[0].geometry,
        coords = geom.coordinates;

    Shape.getNodes({ changeset: cs }, function(err,nodes) {
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

var shapeCS;

describe('GeoJSON', function() {

describe('#normalize()', function() {
    it('should normalize GeoJSON properties', function() {
        var normal = geojson.normalize(point);
        var props = normal.features[0].properties;
        expect(props).to.have.property('name_sm');
        expect(props.type).to.equal('country');
    });
});

describe('#import()', function() {
    this.timeout(6000);

    it('should fail if GeoJSON isn\'t valid', function(done) {
        geojson.import({
            geojson: invalid,
            period: 1, user: 1, type: 1
        }, function(err, cs) {
            expect(err+'').to.contain('GeoJSON has 1 error');
            done();
        });
    });

    it('should import a point', function(done) {
        geojson.import({
            geojson: point,
            period: 1, user: 1, type: 1
        }, function(err, cs) {
            expect(err).to.not.be.ok;
            assert.checkNodes(point, cs, done);
        });
    });

    it('should import a line', function(done) {
        geojson.import({
            geojson: line,
            period: 1, user: 1, type: 1
        }, function(err, cs) {
            assert.ifError(err);
            assert.checkNodes(line, cs, done);
        });
    });

    it('should import a polygon', function(done) {
        geojson.import({
            geojson: polygon,
            period: 1, user: 1, type: 1
        }, function(err, cs) {
            assert.ifError(err);
            assert.checkNodes(polygon, cs, done);
        });
    });

    it('shouldn\'t duplicate an existing shape', function(done) {
        geojson.import({
            geojson: polygon,
            period: 2, user: 1, type: 1,
            duplicate: false
        }, function(err, cs) {
            assert.ifError(err);
            assert.checkNodes(polygon, cs, done);
        });
    });

    it('should import a multipolygon', function(done) {
        geojson.import({
            geojson: multiPolygon,
            period: 1, user: 1, type: 1
        }, function(err, cs) {
            assert.ifError(err);
            shapeCS = cs;
            assert.checkNodes(multiPolygon, cs, done);
        });
    });

    it('should import correct data', function(done) {
        Shape.inChangeset(shapeCS, function(err, shapes) {
            assert.ifError(err);
            var data = shapes[0].properties;
            assert.equal(data.name, 'multi poly');
            assert.equal(data.periods[0], 1);
            assert.equal(data.type_id, 1);
            assert.equal(data.data.a, 55);
            done();
        });
    });

    it('should import polygon roles', function(done) {
        Shape.inChangeset(shapeCS, function(err, shapes) {
            assert.ifError(err);
            var objects = shapes[0].objects;
            assert.equal(objects[0].role, 'outer');
            assert.equal(objects[1].role, 'inner');
            assert.equal(objects[2].role, 'outer');
            done();
        });
    });

    // TODO: it('should share existing nodes');

});

});
