var assert = require('assert');
var Step = require('step');
var fs = require('fs');
var request = require('supertest');

var app = require('../../app');
request = request(app);

var lyr = 0, shp = 10;

describe('Shape controller', function() {

describe('GET /layers/:lid/shapes/:id.json', function() {
    this.timeout(1000);
    it('should respond with shape data', function(done) {
        request.get('/layers/'+lyr+'/shapes/'+shp+'.json')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.body.period, 1);
            assert.equal(res.body.data.a, "1");
            done();
          });
    });
});

describe('GET /layers/:lid/shapes/:id.geojson', function() {
    this.timeout(1000);
    it('should respond with shape geojson', function(done) {
        request.get('/layers/'+lyr+'/shapes/'+shp+'.geojson')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.body.type, "FeatureCollection");
            assert.equal(res.body.features[0].properties.gid, shp);
            done();
          });
    });
});

});
