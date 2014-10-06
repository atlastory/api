process.env.TEST = 'true';

var expect = require('chai').expect;
var request = require('supertest');

var app = require('../../app');
request = request(app);

var directives = [{
    action: 'add',
    object: 'node',
    geometry: '[14.52, 12.16]'
},{
    action: 'add',
    object: 'shape',
    data: '{type_id:1,name:"Mountain View",start_year:1956,end_year:2010}',
    shape_relations: '[]'
}];

var id = 1;

describe('Changeset controller', function() {
this.timeout(2000);

describe('POST /changesets', function() {
    /*it('should create new changeset', function(done) {
        request.post('/changesets')
          .send({ user_id: 1, directives: directives })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {

          }).end(done);
    });*/

    /*it('should replace old changeset', function(done) {
        directives[0].layer = 88;
        request.post('/changesets')
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
        request.post('/changesets')
          .send({directives: []})
          .expect('Content-Type', /text/)
          .expect(500)
          .end(function(err,res){
            assert(/Needs.a.changeset/.test(res.text));
            done();
          });
    });*/
});

/*describe('GET /changesets/:id', function() {
    it('should respond with changeset json', function(done) {
        request.get('/changesets/'+id)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            var cs = res.body;
            expect(cs.user_id).to.equal(1);
            expect(cs.directives).to.have.length(2);
            expect(cs.directives[0].object).to.equal('period');
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
});*/

/*describe('POST /changesets/:id/commit', function() {
    this.timeout(0);
    it('should commit changeset & return checks', function(done) {
        request.post('/changesets/'+hash+'/commit')
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

describe('DELETE /changesets/:id', function() {
    this.timeout(1000);
    it('should delete changeset', function(done) {
        request.del('/changeset/'+hash)
          .expect(200)
          .end(done);
    });
});*/


});
