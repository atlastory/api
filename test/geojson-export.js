process.env.TEST = 'true';
;
var expect = require('chai').expect;

// Make sure import is run before export
require('./geojson-import.js');

var geojson = require('../lib/geojson'),
    Shape = require('../models/Shape'),
    gj = require('./helpers/geojson');

var shapeCS;

describe('GeoJSON', function() {

describe('#export()', function() {
    this.timeout(6000);

    it('should export a point', function(done) {
        geojson.export({
            period: gj.point.period, type: 1
        }).then(function(json) {
            var shape = json.features[0];
            expect(shape.geometry).to.deep.equal(gj.point.features[0].geometry);
            expect(shape.properties.data.type).to.equal('country');
            expect(shape.properties.data.name_sm).to.equal('ln');
        }).then(done,done);
    });

    it('should export a line', function(done) {
        geojson.export({
            period: gj.line.period, type: 1
        }).then(function(json) {
            var shape = json.features[0];
            expect(shape.geometry).to.deep.equal(gj.line.features[0].geometry);
            expect(shape.properties.data.name).to.equal('line');
        }).then(done,done);
    });

    it('should export a multiline', function(done) {
        geojson.export({
            period: gj.multiline.period, type: 1
        }).then(function(json) {
            var shape = json.features[0];
            expect(shape.geometry).to.deep.equal(gj.multiline.features[0].geometry);
            expect(shape.properties.data.name).to.equal('multi line');
        }).then(done,done);
    });

    it('should export a polygon', function(done) {
        geojson.export({
            period: gj.polygon.period, type: 1
        }).then(function(json) {
            var shape = json.features[0];
            expect(shape.geometry).to.deep.equal(gj.polygon.features[0].geometry);
            expect(shape.properties.data.name).to.equal('poly');
        }).then(done,done);
    });

    it('should export a multipolygon', function(done) {
        geojson.export({
            period: gj.multiPolygon.period,
            type: 1
        }).then(function(json) {
            var shape = json.features[0];
            expect(shape.geometry).to.deep.equal(gj.multiPolygon.features[0].geometry);
            expect(shape.properties.data.name).to.equal('multi poly');
        }).then(done,done);
    });

    it('should export using year', function(done) {
        geojson.export({
            year: 1999,
            type: 1
        }).then(function(json) {
            var shape = json.features[0];
            expect(shape.geometry).to.deep.equal(gj.multiPolygon.features[0].geometry);
            expect(shape.properties.data.name).to.equal('multi poly');
        }).then(done,done);
    });

});

});
