process.env.TEST = 'true';

var expect = require('chai').expect;
var request = require('supertest');

var app = require('../../app');
request = request(app);

describe('source controller', function () {
this.timeout(1000);

var src = 1;
var newId;

describe('GET /sources', function() {
    it('should respond with all source data', function(done) {
        request.get('/sources')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body[0].source).to.equal("http://forum.atlastory.com/");
          }).end(done);
    });
});

describe('GET /sources/:id', function() {
    it('should respond with source data', function(done) {
        request.get('/sources/' + src)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body.source).to.equal("http://forum.atlastory.com/");
          }).end(done);
    });

    it('should respond with error', function(done) {
        request.get('/sources/111222')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .expect(function(res) {
            expect(res.body.message).to.have.string("not found");
          }).end(done);
    });
});

describe('POST /sources', function() {
    it('should fail with incorrect input', function(done) {
        request.post('/sources')
          .send({ source: 'http://url.com' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .expect(function(res) {
            expect(res.body.message).to.have.property('name');
          }).end(done);
    });

    it('should create new source', function(done) {
        request.post('/sources')
          .send({ name: 'test', source: 'http://url.com' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body.id).to.be.a('number');
            newId = res.body.id;
          }).end(done);
    });
});

describe('PUT /sources/:id', function() {
    it('shouldnt update source with incorrect input', function(done) {
        request.put('/sources/111222333')
          .send({ source: '' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .expect(function(res) {
            expect(res.body.message).to.have.string('not found');
          }).end(done);
    });

    it('should update a source', function(done) {
        request.put('/sources/' + newId)
          .send({ name: 'test222' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(done);
    });
});

describe('DELETE /sources/:id', function() {
    it('shouldnt delete source without id', function(done) {
        request.del('/sources/aaa')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .expect(function(res) {
            expect(res.body.message).to.have.string('ID required');
          }).end(done);
    });

    it('should delete a source', function(done) {
        request.del('/sources/' + newId)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(done);
    });
});


});
