process.env.ENV_VARIABLE = 'test';

var assert = require('assert');
var expect = require('chai').expect;
var request = require('supertest');

var app = require('../../app');
request = request(app);

describe('type controller', function () {
this.timeout(0);

var t = 1;
var newId;

describe('GET /types', function() {
    it('should respond with all type data', function(done) {
        request.get('/types')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.body[0].type, "land");
            done();
          });
    });
});

describe('GET /types/:id', function() {
    it('should respond with type data', function(done) {
        request.get('/types/' + t)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.body.name, "Land");
            done();
          });
    });
});

describe('POST /types', function() {
    it('should fail with incorrect input', function(done) {
        request.post('/types')
          .send({ name: 'Country' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(500)
          .end(function(err, res) {
            expect(err).to.not.be.ok;
            expect(res.body.message).to.have.property('type');
            done();
          });
    });

    it('should create new type', function(done) {
        request.post('/types')
          .send({ name: 'Country', type: 'admin-1' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            expect(err).to.not.be.ok;
            expect(res.body.id).to.be.a('number');
            newId = res.body.id;
            done();
          });
    });
});

describe('PUT /types/:id', function() {
    it('shouldnt update type with incorrect input', function(done) {
        request.put('/types/111222333')
          .send({ type: '' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(500)
          .end(function(err, res) {
            expect(err).to.not.be.ok;
            expect(res.body.message).to.have.string('not found');
            done();
          });
    });

    it('should update a type', function(done) {
        request.put('/types/' + newId)
          .send({ name: 'Dependency' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            expect(err).to.not.be.ok;
            done();
          });
    });
});


});
