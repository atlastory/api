var assert = require('assert');
var Step = require('step');
var fs = require('fs');
var request = require('supertest');

var app = require('../../app');
request = request(app);

var per = 1;

describe('Period controller', function() {

describe('GET /layers/:lid/periods', function() {
    this.timeout(1200);
    it('should respond with periods json', function(done) {
        request.get('/layers/1/periods')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.body[0].layer_id, 1);
            done();
          });
    });
});

describe('GET /layers/:lid/periods/:pid', function() {
    this.timeout(2000);
    it('should respond with period json', function(done) {
        request.get('/layers/1/periods/'+per)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.body.layer_id, 1);
            done();
          });
    });
});

describe('GET /layers/:id/shapes.json', function() {
    this.timeout(0);
    it('should respond with data json', function(done) {
        request.get('/layers/1/periods/'+per+'/shapes.json?bbox=7,7,9,9')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            assert.ifError(err);
            var j = res.body;
            assert.equal(j[0].name, "mocha");
            assert.equal(j[0].data.a, "1");
            done();
          });
    });
});

describe('GET /layers/:id/shapes.geojson', function() {
    this.timeout(0);
    it('should respond with geojson', function(done) {
        request.get('/layers/1/periods/'+per+'/shapes.geojson?bbox=7,7,9,9')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            assert.ifError(err);
            var j = res.body;
            assert.equal(j.type, "FeatureCollection");
            assert.equal(j.features[0].type, "Feature");
            done();
          });
    });
});

describe('GET /layers/:id/shapes.topojson', function() {
    this.timeout(0);
    it('should respond with topojson', function(done) {
        request.get('/layers/1/periods/'+per+'/shapes.topojson?bbox=7,7,9,9')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            assert.ifError(err);
            var j = res.body;
            assert.equal(j.type, "Topology");
            assert(typeof j.bbox[0] === "number");
            done();
          });
    });
});

});
