process.env.TEST = 'true';

var expect = require('chai').expect;
var request = require('supertest');

var cs = require('../helpers/changeset');

var app = require('../../app');
request = request(app);

var id;

describe('Changeset controller', function() {
this.timeout(2000);

describe('POST /changesets', function() {
    it('should create new changeset', function(done) {
        request.post('/changesets')
          .send({ user_id: 1, message: "" })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body.id).to.match(/^\d+/);
            id = res.body.id;
          }).end(done);
    });

    it('should update changeset message', function(done) {
        request.post('/changesets')
          .send({id: id, message: "test"})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body.response).to.have.string('updated');
          }).end(done);
    });

    it('should fail with incorrect input', function(done) {
        request.post('/changesets')
          .send({ })
          .expect('Content-Type', /json/)
          .expect(400)
          .expect(function(res) {
            expect(res.body).to.have.deep.property('detail.user_id');
          }).end(done);
    });
});

describe('POST /changesets/:id/commit', function() {
  var dirs = [
    cs.add.node1, cs.add.node1,
    cs.add.way1, cs.add.shape1
  ];
    it('should commit changeset & return checks', function(done) {
        request.post('/changesets/'+id+'/commit')
          .send({ directives: dirs })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body).to.have.length(4);
            expect(res.body[3]).to.have.property('status','success');
          }).end(done);
    });
});

describe('GET /changesets/:id', function() {
    it('should respond with changeset json', function(done) {
        request.get('/changesets/'+id)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            var cs = res.body;
            expect(cs.user_id).to.equal(1);
            expect(cs.directives).to.have.length(4);
            expect(cs.directives[0].object).to.equal('node');
          }).end(done);
    });

    it('should respond with changeset txt', function(done) {
        request.get('/changesets/'+id+'.txt')
          .set('Accept', 'application/json')
          .expect('Content-Type', /text/)
          .expect(200)
          .expect(function(res) {
            expect(res.text).to.have.string("directives");
          }).end(done);
    });

    it('should respond with error', function(done) {
        request.get('/changesets/111222')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .expect(function(res) {
            expect(res.body.message).to.have.string("not found");
          }).end(done);
    });
});


});
