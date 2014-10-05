process.env.TEST = 'true';

var assert = require('assert');
var expect = require('chai').expect;
var Shape = require('../../models/Shape');
var Changeset = require('../../models/Changeset');

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
            var id = shapes[0].id;
            expect(id).to.be.a("string");
            shape = id;
        }).then(done,done);
    });
});

describe('#find()', function() {
    it('should find a Shape', function(done) {
        Shape.find(shape).then(function(s) {
            s = s[0];
            expect(s.data.name).to.equal('Test');
            expect(s.tags[0]).to.equal(12);
            expect(s.data.country).to.equal('Spain');
        }).then(done,done);
    });
});

describe('#connect()', function() {
    it('should connect a Shape to nodes/ways', function(done) {
        Shape.connect(shape, [
            {type: 'Node', id: 1}, {type: 'Node', id: 2},
            {type: 'Way', id: 1}
        ]).then(function(res) {
            //
        }).then(done,done);
    });
});

describe('#get()', function() {
    it('should get a shape with nodes/ways', function(done) {
        Shape.get(shape).then(function(s) {
            expect(s.properties.end_year).to.equal(1492);
            expect(s.objects[0].type).to.equal('Node');
        }).then(done,done);
    });
});

describe('#inChangeset()', function() {
    it('should get a shapes in a changeset', function(done) {
        Changeset.create({
            user_id: 1,
            directives: [{
                action: 'add',
                object: 'shape',
                object_id: shape
            }]
        }).then(function(cs) {
            return Shape.inChangeset(cs);
        }).then(function(shapes) {
            expect(shapes[0].properties.end_year).to.equal(1492);
        }).then(done,done);
    });
});

describe('#getNodes()', function() {
    it('should get nodes for shapes in a period', function(done) {
        Shape.getNodes({ period: 1 }).then(function(nodes) {
            expect(nodes).to.have.length.above(0);
            expect(nodes[0]).to.have.property('seq1');
        }).then(done,done);
    });

    it('should get nodes for shapes in types', function(done) {
        Shape.getNodes({ period: 1, type: [1] }).then(function(nodes) {
            expect(nodes).to.have.length.above(0);
            expect(nodes[0]).to.have.property('shape');
            expect(nodes[0]).to.have.property('role');
            expect(nodes[0]).to.have.property('seq1');
        }).then(done,done);
    });

    it('should get nodes for shapes in a year', function(done) {
        Shape.getNodes({ year: 1491, type: [1] }).then(function(nodes) {
            expect(nodes).to.have.length.above(0);
            expect(nodes[0]).to.have.property('shape');
            expect(nodes[0]).to.have.property('role');
            expect(nodes[0]).to.have.property('seq1');
        }).then(done,done);
    });
});

});
