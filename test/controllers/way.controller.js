process.env.TEST = 'true';

var expect = require('chai').expect;
var request = require('supertest');

var app = require('../../app');
request = request(app);

describe('way controller', function () {
this.timeout(1000);

var way = 1;
var newId;

describe('GET /ways', function() {
    it('should respond with error', function(done) {
        request.get('/ways')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(403)
          .end(done);
    });
});

describe('GET /ways/:id', function() {
    it('should respond with way data', function(done) {
        request.get('/ways/' + way)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body).to.have.property('id', '1');
            expect(res.body.nodes).to.have.length.above(5);
          }).end(done);
    });

    it('should respond with error', function(done) {
        request.get('/ways/111222')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .expect(function(res) {
            expect(res.body.message).to.have.string("not found");
          }).end(done);
    });

    it('should respond with geojson', function(done) {
        request.get('/ways/' + way + '.geojson')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body.properties).to.have.property('created_at');
            expect(res.body.geometry.coordinates[0][0]).to.be.a('number');
          }).end(done);
    });

    it('should respond with topojson', function(done) {
        request.get('/ways/' + way + '.topojson')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body.type).to.equal('Topology');
            expect(res.body.arcs[0]).to.have.length.above(5);
          }).end(done);
    });
});

});
