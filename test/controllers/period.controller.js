process.env.TEST = 'true';

var expect = require('chai').expect;
var request = require('supertest');

var app = require('../../app');
var gj = require('../helpers/geojson');
request = request(app);

describe('period controller', function () {
this.timeout(1000);

var p = 1;
var newId;

describe('GET /periods', function() {
    it('should respond with all period data', function(done) {
        request.get('/periods')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body[0].start_year).to.equal(1999);
          }).end(done);
    });
});

describe('GET /periods/:id', function() {
    it('should respond with period data', function(done) {
        request.get('/periods/' + p)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body.name).to.equal("1999-2000");
          }).end(done);
    });

    it('should respond with error', function(done) {
        request.get('/periods/111222')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .expect(function(res) {
            expect(res.body.message).to.have.string("not found");
          }).end(done);
    });
});

/*describe('POST /periods', function() {
    it('should fail with incorrect input', function(done) {
        request.post('/periods')
          .send({ start_year: 1986 })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(500)
          .expect(function(res) {
            expect(res.body.detail).to.have.property('end_year');
          }).end(done);
    });

    it('should create new period', function(done) {
        request.post('/periods')
          .send({ start_year: 1939, end_year: 1945 })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body.id).to.be.a('number');
            newId = res.body.id;
          }).end(done);
    });
});

describe('PUT /periods/:id', function() {
    it('shouldnt update period with incorrect input', function(done) {
        request.put('/periods/111222333')
          .send({ name: '' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .expect(function(res) {
            expect(res.body.message).to.have.string('not found');
          }).end(done);
    });

    it('should update a period', function(done) {
        request.put('/periods/' + newId)
          .send({ name: 'Dependency' })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(done);
    });
});



describe('DELETE /periods/:id', function() {
    it('shouldnt delete period without id', function(done) {
        request.del('/periods/aaa')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .expect(function(res) {
            expect(res.body.message).to.have.string('ID required');
          }).end(done);
    });

    it('should delete a period', function(done) {
        request.del('/periods/' + newId)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(done);
    });
});*/

describe('GET /periods/:pid/:type.:format', function() {
    it('should get geojson with type name', function(done) {
        request.get('/periods/'+gj.multiPolygon.period+'/land.geojson')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            var shape = res.body.features[0];
            expect(shape.type).to.equal("Feature");
          }).end(done);
    });

    it('should get geojson with type name', function(done) {
        request.get('/periods/'+gj.multiPolygon.period+'/1.geojson')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            var shape = res.body.features[0];
            expect(shape.type).to.equal("Feature");
          }).end(done);
    });

    it('should get topojson with type name', function(done) {
        request.get('/periods/'+gj.multiPolygon.period+'/land.topojson')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            expect(res.body.type).to.equal('Topology');
            expect(res.body.bbox[0]).to.be.a('number');
          }).end(done);
    });
});

describe('GET /year/:year/:type.:format', function() {
    var year = gj.multiPolygon.features[0].properties.start_year + 2;
    it('should get geojson with year, type', function(done) {
        request.get('/year/'+year+'/land.geojson')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            var shape = res.body.features[0];
            expect(shape.type).to.equal("Feature");
            expect(shape.properties.start_year).to.equal(year - 2);
          }).end(done);
    });
});

describe('GET /geojson', function() {
    it('should get geojson with type ID', function(done) {
        request.get('/geojson')
          .send({ type_id: 1, period: gj.multiPolygon.period })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function(res) {
            var shape = res.body.features[0];
            expect(shape.type).to.equal("Feature");
          }).end(done);
    });
});

});
