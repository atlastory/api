var assert = require('assert');
var Step = require('step');
var fs = require('fs');
var request = require('supertest');

var app = require('../../app');
request = request(app);

var lyr = 64, shp = 2;

describe('Shape controller', function() {

describe('GET /layer/:lid/shape/:id', function() {
    this.timeout(1000);
    it('should respond with shape geojson', function(done) {
        request.get('/layer/'+lyr+'/s/'+shp)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.body.type, "FeatureCollection");
            assert.equal(res.body.features[0].properties.gid, shp);
            done();
          });
    });
});

});
