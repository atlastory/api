process.env.ENV_VARIABLE = 'test';

var assert = require('assert');
var expect = require('chai').expect;

var geojson = require('../lib/geojson'),
    Shape = require('../models/Shape'),
    gj = require('./helpers/geojson');


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
        }, function(err, cs) {
            expect(err+'').to.contain('GeoJSON has 1 error');
            done();
        });
    });

    it('should import a point', function(done) {
        geojson.import({
            geojson: gj.point,
            period: gj.point.period, user: 1, type: 1
        }, function(err, cs) {
            expect(err).to.not.be.ok;
            assert.checkNodes(gj.point, cs, done);
        });
    });

    it('should import a multipoint', function(done) {
        geojson.import({
            geojson: gj.multiPoint,
            period: gj.multiPoint.period, user: 1, type: 1
        }, function(err, cs) {
            expect(err).to.not.be.ok;
            assert.checkNodes(gj.multiPoint, cs, done);
        });
    });

    it('should import a line', function(done) {
        geojson.import({
            geojson: gj.line,
            period: gj.line.period, user: 1, type: 1
        }, function(err, cs) {
            assert.ifError(err);
            assert.checkNodes(gj.line, cs, done);
        });
    });

    it('should import a multiline', function(done) {
        geojson.import({
            geojson: gj.multiline,
            period: gj.multiline.period, user: 1, type: 1
        }, function(err, cs) {
            assert.ifError(err);
            assert.checkNodes(gj.multiline, cs, done);
        });
    });

    it('should import a polygon', function(done) {
        geojson.import({
            geojson: gj.polygon,
            period: gj.polygon.period, user: 1, type: 1
        }, function(err, cs) {
            assert.ifError(err);
            assert.checkNodes(gj.polygon, cs, done);
        });
    });

    it('shouldn\'t duplicate an existing shape', function(done) {
        geojson.import({
            geojson: gj.polygon,
            period: 2, user: 1, type: 1,
            duplicate: false
        }, function(err, cs) {
            assert.ifError(err);
            assert.checkNodes(gj.polygon, cs, done);
        });
    });

    it('should import a multipolygon', function(done) {
        geojson.import({
            geojson: gj.multiPolygon,
            period: gj.multiPolygon.period, user: 1, type: 1
        }, function(err, cs) {
            assert.ifError(err);
            shapeCS = cs;
            assert.checkNodes(gj.multiPolygon, cs, done);
        });
    });

    it('should import correct data', function(done) {
        Shape.inChangeset(shapeCS, function(err, shapes) {
            assert.ifError(err);
            var data = shapes[0].properties;
            assert.equal(data.data.name, 'multi poly');
            assert.equal(data.periods[0], 106);
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
