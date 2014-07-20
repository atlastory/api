process.env.ENV_VARIABLE = 'test';

var expect = require('chai').expect;
var request = require('supertest');

var app = require('../../app');
request = request(app);

describe('type controller', function () {
this.timeout(1000);

var t = 1;
var newId;

describe('GET /types', function() {
    it('should respond with all type data', function(done) {
        request.get('/types')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body[0].type).to.equal("land");
          }).end(done);
    });
});

describe('GET /types/:id', function() {
    it('should respond with type data', function(done) {
        request.get('/types/' + t)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body.name).to.equal("Land");
          }).end(done);
    });

    it('should respond with error', function(done) {
        request.get('/types/111222')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .expect(function(res) {
            expect(res.body.message).to.have.string("not found");
          }).end(done);
    });
});

describe('POST /types', function() {
    it('should fail with incorrect input', function(done) {
        request.post('/types')
          .send({ name: 'Country' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .expect(function(res) {
            expect(res.body.message).to.have.property('type');
          }).end(done);
    });

    it('should create new type', function(done) {
        request.post('/types')
          .send({ name: 'Country', type: 'admin-1' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body.id).to.be.a('number');
            newId = res.body.id;
          }).end(done);
    });
});

describe('PUT /types/:id', function() {
    it('shouldnt update type with incorrect input', function(done) {
        request.put('/types/111222333')
          .send({ type: '' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .expect(function(res) {
            expect(res.body.message).to.have.string('not found');
          }).end(done);
    });

    it('should update a type', function(done) {
        request.put('/types/' + newId)
          .send({ name: 'Dependency' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(done);
    });
});

describe('DELETE /types/:id', function() {
    it('shouldnt delete type without id', function(done) {
        request.del('/types/aaa')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .expect(function(res) {
            expect(res.body.message).to.have.string('ID required');
          }).end(done);
    });

    it('should delete a type', function(done) {
        request.del('/types/' + newId)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(done);
    });
});


});
