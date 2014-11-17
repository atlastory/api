process.env.TEST = 'true';

var expect = require('chai').expect;
var request = require('supertest');

var app = require('../../app');
request = request(app);

describe('node controller', function () {
this.timeout(1000);

var node = 1;
var newId;

describe('GET /nodes', function() {
    it('should respond with error', function(done) {
        request.get('/nodes')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(403)
          .end(done);
    });
});

describe('GET /nodes/:id', function() {
    it('should respond with node data', function(done) {
        request.get('/nodes/' + node)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body).to.have.property("longitude");
            expect(res.body).to.have.property("latitude");
          }).end(done);
    });

    it('should respond with error', function(done) {
        request.get('/nodes/111222')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .expect(function(res) {
            expect(res.body.message).to.have.string("not found");
          }).end(done);
    });
});

});
