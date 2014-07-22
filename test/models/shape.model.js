process.env.ENV_VARIABLE = 'test';

var assert = require('assert');
var expect = require('chai').expect;
var Shape = require('../../models/Shape');

var shape;

describe('Shape model', function() {

describe('#create()', function() {
    it('should create a Shape with nodes', function(done) {
        Shape.create({
            periods: [1],
            type_id: 1,
            name: 'Test',
            start_year: 1491,
            end_year: 1492,
            tags: [12],
            country: 'Spain'
        }).then(function(shapes) {
            var id = parseFloat(shapes[0].id);
            expect(id).to.be.a("number");
            shape = id;
        }).fin(done);
    });
});

describe('#find()', function() {
    it('should find a Shape', function(done) {
        Shape.find(shape).then(function(s) {
            s = s[0];
            expect(s.data.name).to.equal('Test');
            expect(s.tags[0]).to.equal(12);
            expect(s.data.country).to.equal('Spain');
        }).fin(done);
    });
});

describe('#connect()', function() {
    it('should connect a Shape to nodes/ways', function(done) {
        Shape.connect(shape, [
            {type: 'Node', id: 1}, {type: 'Node', id: 2},
            {type: 'Way', id: 1}
        ]).fin(done);
    });
});

describe('#get()', function() {
    it('should get a shape with nodes/ways', function(done) {
        Shape.get(shape).then(function(s) {
            expect(s.properties.end_year).to.equal(1492);
            expect(s.objects[0].type).to.equal('Node');
        }).fin(done);
    });
});

describe('#getNodes()', function() {
    it('should get nodes for shapes in a period', function(done) {
        Shape.getNodes({ period: 1 }).then(function(nodes) {
            expect(nodes).to.have.length.above(0);
            expect(nodes[0]).to.have.property('seq1');
        }).fin(done);
    });

    it('should get nodes for shapes in types', function(done) {
        Shape.getNodes({ period: 1, type: [1] }).then(function(nodes) {
            expect(nodes).to.have.length.above(0);
            expect(nodes[0]).to.have.property('shape');
            expect(nodes[0]).to.have.property('role');
            expect(nodes[0]).to.have.property('seq1');
        }).fin(done);
    });
});

});
