var assert = require('assert');
var Step = require('step');
var fs = require('fs');
var request = require('supertest');

var app = require('../app');
request = request(app);

var lyr = 64;

describe('Layer controller', function() {

describe('GET /map/:mid/layer', function() {
    this.timeout(1000);
    it('should respond with layers json', function(done) {
        request.get('/map/1/layer')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.body[0].map_id, 1);
            done();
          });
    });
});

describe('GET /map/:mid/layer/:id', function() {
    this.timeout(1000);
    it('should respond with layer json', function(done) {
        request.get('/map/1/layer/'+lyr)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200, done);
    });
});

});
