process.env.ENV_VARIABLE = 'test';

var assert = require('assert');
var expect = require('chai').expect;

var geojson = require('../lib/geojson'),
    Shape = require('../models/Shape');


var point = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "point", "a": "b", "type": "Country", "ABBREV": "ln" },
            "geometry": {
                "type": "Point",
                "coordinates": [0.5212, 4.1789]
            }
        }
    ]
};

var multipoint = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "multi point" },
            "geometry": {
                "type": "MultiPoint",
                "coordinates": [[60, 60], [40, 40]]
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

var multiline = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "multi line", "a": "b" },
            "geometry": {
                "type": "MultiLineString",
                "coordinates": [[[10,10], [14,14], [18,28]], [[22,22], [11,11], [14,14]]]
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


var shapeCS;

describe('GeoJSON', function() {

describe('#export()', function() {
    this.timeout(6000);


    it('should export a point', function(done) {
        geojson.export({
            period: 101
        }, function(err, json) {
            expect(err).to.not.be.ok;
            var shape = json.features[0];
            expect(shape.geometry).to.deep.equal(point.features[0].geometry);
            expect(shape.properties.data.type).to.equal('country');
            expect(shape.properties.data.name_sm).to.equal('ln');
            done();
        });
    });

    it('should export a line', function(done) {
        geojson.export({
            period: 102
        }, function(err, json) {
            expect(err).to.not.be.ok;
            var shape = json.features[0];
            expect(shape.geometry).to.deep.equal(line.features[0].geometry);
            expect(shape.properties.name).to.equal('line');
            done();
        });
    });

    it('should export a multiline', function(done) {
        geojson.export({
            period: 105
        }, function(err, json) {
            expect(err).to.not.be.ok;
            var shape = json.features[0];
            expect(shape.geometry).to.deep.equal(multiline.features[0].geometry);
            expect(shape.properties.name).to.equal('multi line');
            done();
        });
    });

    it('should export a polygon', function(done) {
        geojson.export({
            period: 103
        }, function(err, json) {
            expect(err).to.not.be.ok;
            var shape = json.features[0];
            expect(shape.geometry).to.deep.equal(polygon.features[0].geometry);
            expect(shape.properties.name).to.equal('poly');
            done();
        });
    });

    it('should export a multipolygon', function(done) {
        geojson.export({
            period: 104
        }, function(err, json) {
            expect(err).to.not.be.ok;
            var shape = json.features[0];
            expect(shape.geometry).to.deep.equal(multiPolygon.features[0].geometry);
            expect(shape.properties.name).to.equal('multi poly');
            done();
        });
    });

});

});
