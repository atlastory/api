process.env.TEST = 'true';

var expect = require('chai').expect;
var request = require('supertest');

var app = require('../../app');
request = request(app);

describe('shape controller', function () {
this.timeout(1000);

var shape = 6;
var newId;

describe('GET /shapes', function() {
    it('should respond with error', function(done) {
        request.get('/shapes')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(403)
          .end(done);
    });
});

describe('GET /shapes/:id', function() {
    it('should respond with shape data', function(done) {
        request.get('/shapes/' + shape)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body).to.have.deep.property('properties.type_id');
            expect(res.body.objects[0]).to.include.keys('type','id','role');
          }).end(done);
    });

    it('should respond with error', function(done) {
        request.get('/shapes/111222.geojson')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .expect(function(res) {
            expect(res.body.message).to.have.string("not found");
          }).end(done);
    });

    it('should respond with geojson', function(done) {
        request.get('/shapes/' + shape + '.geojson')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body.properties).to.have.property('end_year');
            expect(res.body.geometry.coordinates[0]).to.be.an('array');
          }).end(done);
    });

    it('should respond with topojson', function(done) {
        request.get('/shapes/' + shape + '.topojson')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body.type).to.equal('Topology');
          }).end(done);
    });
});

});
