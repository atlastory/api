process.env.TEST = 'true';

var assert = require('assert');
var expect = require('chai').expect;
var Period = require('../../models/Period'),
    Changeset = require('../../models/Changeset'),
    gj = require('../helpers/geojson');

var per = 1,
    period;

describe('Period model', function() {

describe('#find()', function() {
    this.timeout(1000);
    it('should get a single period', function(done) {
        Period.find(per).then(function(p) {
            p = p[0];
            assert.equal(p.id, per);
            assert.equal(p.end_year, 2000);
            period = p;
        }).then(done,done);
    });
});

describe('#importGeoJSON()', function() {
    this.timeout(6000);
    it('should import a point', function(done) {
        Period.importGeoJSON(42, {
            geojson: gj.point, type: 1
        }, { user: 1 }).then(function(cs) {
            expect(cs).to.be.a('string');
            return Changeset.get(cs);
        }).then(function(cs) {
            expect(cs.directives[0].data.name).to.equal('point');
        }).then(done,done);
    });
});

describe('#getGeoJSON()', function() {
    this.timeout(6000);
    it('should get a GeoJSON', function(done) {
        Period.getGeoJSON(42, { type: 1 }).then(function(json) {
            expect(json.type).to.equal('FeatureCollection');
            expect(json.features[0].geometry).to.deep.equal(gj.point.features[0].geometry);
        }).then(done,done);
    });
});

describe('#getTopoJSON()', function() {
    this.timeout(6000);
    it('should get a TopoJSON', function(done) {
        Period.getTopoJSON(per, { type: 1 })
        .then(function(json) {
            expect(json.type).to.equal('Topology');
            expect(json.bbox[0]).to.be.a('number');
        }).then(done,done);
    });
});

});
