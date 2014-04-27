process.env.ENV_VARIABLE = 'test';

var assert = require('assert');
var fs = require('fs');
var request = require('supertest');

var app = require('../../app');
request = request(app);

var directives = [
  {
    user_id: 4,
    action: 'delete',
    object: 'test',
    layer: 0,
    period: 1,
    shape: 53,
    type: '["Test","Controller"]',
    geom_diff: '[[1,2,[0,0]]]'
  },{
    user_id: 4,
    action: 'edit',
    object: 'test',
    layer: 0,
    period: 1,
    shape: 54,
    type: '["Test","Controller"]',
    geom_diff: '[[1,2,[1,2]]]'
  }
];

var hash;
/*
describe('Changeset controller', function() {

describe('POST /changeset', function() {
    this.timeout(0);
    it('should create new changeset', function(done) {
        request.post('/changeset')
          .send({directives: directives})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            assert.ifError(err);
            assert(typeof res.body.id === 'string');
            hash = res.body.id;
            done();
          });
    });

    it('should replace old changeset', function(done) {
        directives[0].layer = 88;
        request.post('/changeset')
          .send({id: hash, directives: directives})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.body.id, hash);
            done();
          });
    });

    it('should fail with incorrect json', function(done) {
        request.post('/changeset')
          .send({directives: []})
          .expect('Content-Type', /text/)
          .expect(500)
          .end(function(err,res){
            assert(/Needs.a.changeset/.test(res.text));
            done();
          });
    });
});

describe('GET /changeset/:id', function() {
    this.timeout(1000);
    it('should respond with changeset json', function(done) {
        request.get('/changeset/'+hash)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.body.length, 2);
            assert.equal(res.body[0].action, 'delete');
            assert.equal(res.body[0].layer, 88);
            done();
          });
    });
});

describe('POST /changeset/:id/commit', function() {
    this.timeout(0);
    it('should commit changeset & return checks', function(done) {
        request.post('/changeset/'+hash+'/commit')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            assert.equal(res.body.length, 2);
            assert.equal(res.body[0].parsed, true);
            assert.equal(res.body[0].response, '');
            done();
          });
    });
});

describe('DELETE /changeset/:id', function() {
    this.timeout(1000);
    it('should delete changeset', function(done) {
        request.del('/changeset/'+hash)
          .expect(200)
          .end(done);
    });
});

});
*/