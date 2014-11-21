process.env.TEST = 'true';

var assert = require('assert');
var expect = require('chai').expect;

var geojson = require('../lib/geojson'),
    Shape = require('../models/Shape'),
    gj = require('./helpers/geojson');


var checkNodes = function(geojson, cs) {
    var prop = geojson.features[0].properties,
        geom = geojson.features[0].geometry,
        coords = geom.coordinates;

    return Shape.getNodes({ changeset: cs }).then(function(nodes) {
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
    });
};

var shapeCS, polyCS;

describe('GeoJSON', function() {

describe('#normalize()', function() {
    it('should normalize GeoJSON properties', function() {
        var normal = geojson.normalize(gj.point);
        var props = normal.features[0].properties;
        expect(props).to.have.property('name_sm');
        expect(props.type).to.equal('country');
    });
});

describe('#import()', function() {
    this.timeout(6000);

    it('should fail if GeoJSON isn\'t valid', function(done) {
        geojson.import({
            geojson: gj.invalid,
            period: 1, user: 1, type: 1
        }).fail(function(err) {
            expect(err+'').to.contain('GeoJSON has 1 error');
            done();
        });
    });

    it('should import a point', function(done) {
        geojson.import({
            geojson: gj.point,
            period: gj.point.period, user: 1, type: 1
        }).then(function(cs) {
            return checkNodes(gj.point, cs);
        }).then(done, done);
    });

    it('should import a multipoint', function(done) {
        geojson.import({
            geojson: gj.multiPoint,
            period: gj.multiPoint.period, user: 1, type: 1
        }).then(function(cs) {
            return checkNodes(gj.multiPoint, cs);
        }).then(done, done);
    });

    it('should import a line', function(done) {
        geojson.import({
            geojson: gj.line,
            period: gj.line.period, user: 1, type: 1
        }).then(function(cs) {
            return checkNodes(gj.line, cs);
        }).then(done, done);
    });

    it('should import a multiline', function(done) {
        geojson.import({
            geojson: gj.multiline,
            period: gj.multiline.period, user: 1, type: 1
        }).then(function(cs) {
            return checkNodes(gj.multiline, cs);
        }).then(done, done);
    });

    it('should import a polygon', function(done) {
        geojson.import({
            geojson: gj.polygon,
            period: gj.polygon.period, user: 1, type: 1
        }).then(function(cs) {
            polyCS = cs;
            return checkNodes(gj.polygon, cs);
        }).then(done, done);
    });

    it('shouldn\'t duplicate an existing shape', function(done) {
        geojson.import({
            geojson: gj.polygon,
            period: 2, user: 1, type: 1,
            duplicate: false
        }).then(function(cs) {
            return checkNodes(gj.polygon, cs);
        }).then(done, done);
    });

    it('should import a multipolygon', function(done) {
        geojson.import({
            geojson: gj.multiPolygon,
            period: gj.multiPolygon.period, user: 1, type: 1
        }).then(function(cs) {
            shapeCS = cs;
            return checkNodes(gj.multiPolygon, cs);
        }).then(done, done);
    });

    it('should import correct data', function(done) {
        Shape.inChangeset(shapeCS).then(function(shapes) {
            var data = shapes[0].properties;
            assert.equal(data.data.name, 'multi poly');
            assert.equal(data.periods[0], 106);
            assert.equal(data.type_id, 1);
            assert.equal(data.data.a, 55);
        }).then(done, done);
    });

    it('should import "when" dates', function(done) {
        Shape.inChangeset(polyCS).then(function(shapes) {
            var data = shapes[0].properties;
            assert.equal(data.data.name, 'poly');
            assert.equal(data.start_year, -500);
            assert.equal(data.end_year, 1350);
            assert.equal(data.end_month, 9);
            assert.equal(data.end_day, 12);
        }).then(done, done);
    });

    it('should import polygon roles', function(done) {
        Shape.inChangeset(shapeCS).then(function(shapes) {
            var objects = shapes[0].objects;
            assert.equal(objects[0].role, 'outer');
            assert.equal(objects[1].role, 'inner');
            assert.equal(objects[2].role, 'outer');
        }).then(done, done);
    });

    // TODO: it('should share existing nodes');

});

});
