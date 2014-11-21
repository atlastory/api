process.env.TEST = 'true';

var expect = require('chai').expect;
var request = require('supertest');

var app = require('../../app');
request = request(app);

describe('level controller', function () {
this.timeout(1000);

var t = 1;
var newId;

describe('GET /levels', function() {
    it('should respond with all level data', function(done) {
        request.get('/levels')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body[0].name).to.equal("land");
          }).end(done);
    });
});

describe('GET /levels/:id', function() {
    it('should respond with level data', function(done) {
        request.get('/levels/' + t)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body.name).to.equal("land");
            expect(res.body.types[0].name).to.equal("land");
          }).end(done);
    });

    it('should respond with error', function(done) {
        request.get('/levels/111222')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .expect(function(res) {
            expect(res.body.message).to.have.string("not found");
          }).end(done);
    });

    it('should respond with level types', function(done) {
        request.get('/levels/land/types')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body[0].name).to.equal("land");
          }).end(done);
    });
});

/*describe('POST /levels', function() {
    it('should fail with incorrect input', function(done) {
        request.post('/levels')
          .send({ name: 'admin1' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .expect(function(res) {
            expect(res.body.detail).to.have.property('level');
          }).end(done);
    });

    it('should create new level', function(done) {
        request.post('/levels')
          .send({ name: 'admin1', level: 2 })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body.id).to.be.a('number');
            newId = res.body.id;
          }).end(done);
    });
});

describe('PUT /levels/:id', function() {
    it('shouldnt update level with incorrect input', function(done) {
        request.put('/levels/111222333')
          .send({ level: '' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .expect(function(res) {
            expect(res.body.message).to.have.string('not found');
          }).end(done);
    });

    it('should update a level', function(done) {
        request.put('/levels/' + newId)
          .send({ name: 'admin0' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(done);
    });
});

describe('DELETE /levels/:id', function() {
    it('shouldnt delete level without id', function(done) {
        request.del('/levels/aaa')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .expect(function(res) {
            expect(res.body.message).to.have.string('ID required');
          }).end(done);
    });

    it('should delete a level', function(done) {
        request.del('/levels/' + newId)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(done);
    });
});*/


});
