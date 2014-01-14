var assert = require('assert');
var Step = require('step');
var fs = require('fs');
var request = require('supertest');

var app = require('../../app');
request = request(app);

var lyr = 0;

describe('Layer controller', function() {

describe('GET /layers', function() {
    this.timeout(1000);
    it('should respond with layers json', function(done) {
        request.get('/layers')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.body[0].map_id, 1);
            done();
          });
    });
});

describe('GET /layers/:id', function() {
    this.timeout(1000);
    it('should respond with layer json', function(done) {
        request.get('/layers/'+lyr)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200, done);
    });
});


describe('GET /layers/:id/shapes.json', function() {
    this.timeout(0);
    it('should respond with data json', function(done) {
        request.get('/layers/'+lyr+'/shapes.json?pid=1&bbox=7,7,9,9')
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
        request.get('/layers/'+lyr+'/shapes.geojson?pid=1&bbox=7,7,9,9')
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
        request.get('/layers/'+lyr+'/shapes.topojson?pid=1&bbox=7,7,9,9')
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
