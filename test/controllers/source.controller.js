process.env.ENV_VARIABLE = 'test';

var assert = require('assert');
var expect = require('chai').expect;
var request = require('supertest');

var app = require('../../app');
request = request(app);

describe('source controller', function () {
this.timeout(0);

var src = 1;
var newId;

describe('GET /sources', function() {
    it('should respond with all source data', function(done) {
        request.get('/sources')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.body[0].source, "http://forum.atlastory.com/");
            done();
          });
    });
});

describe('GET /sources/:id', function() {
    it('should respond with source data', function(done) {
        request.get('/sources/' + src)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.body.source, "http://forum.atlastory.com/");
            done();
          });
    });
});

describe('POST /sources', function() {
    it('should fail with incorrect input', function(done) {
        request.post('/sources')
          .send({ source: 'http://url.com' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(500)
          .end(function(err, res) {
            expect(err).to.not.be.ok;
            expect(res.body.message).to.have.property('name');
            done();
          });
    });

    it('should create new source', function(done) {
        request.post('/sources')
          .send({ name: 'test', source: 'http://url.com' })
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

describe('PUT /sources/:id', function() {
    it('shouldnt update source with incorrect input', function(done) {
        request.put('/sources/111222333')
          .send({ source: '' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(500)
          .end(function(err, res) {
            expect(err).to.not.be.ok;
            expect(res.body.message).to.have.string('not found');
            done();
          });
    });

    it('should update a source', function(done) {
        request.put('/sources/' + newId)
          .send({ name: 'test222' })
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
