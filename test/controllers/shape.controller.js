process.env.ENV_VARIABLE = 'test';

var assert = require('assert');
var fs = require('fs');
var request = require('supertest');

var app = require('../../app');
request = request(app);

var per = 1, shp = 1;

/*
describe('Shape controller', function() {

describe('GET /layers/:lid/periods/:pid/shapes/:id.json', function() {
    this.timeout(1000);
    it('should respond with shape data', function(done) {
        request.get('/layers/1/periods/'+per+'/shapes/'+shp+'.json')
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

describe('GET /layers/:lid/periods/:pid/shapes/:id.geojson', function() {
    this.timeout(1000);
    it('should respond with shape geojson', function(done) {
        request.get('/layers/1/periods/'+per+'/shapes/'+shp+'.geojson')
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
*/