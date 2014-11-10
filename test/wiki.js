process.env.TEST = 'true';

var expect = require('chai').expect;
var assert = require('assert');
var _ = require('lodash');

var wiki = require('../lib/wiki');
var cs = require('./helpers/changeset');

var Node = require('../models/Node');
var Way = require('../models/Way');
var Shape = require('../models/Shape');

var newId;

describe('Wiki', function() {

describe('#parse()', function() {
    it('should parse a directive', function(done) {
        wiki.parse([ cs.add.node1 ]).then(function(drs) {
            var d = drs[0];
            expect(d.action).to.equal('add');
            expect(d.object).to.equal('node');
        }).then(done, done);
    });

    it('should correctly replace IDs', function(done) {
        wiki.parse([ cs.add.node1, cs.add.way1 ]).then(function(drs) {
            var node = drs[0], way = drs[1];
            expect(node.object_id).to.not.equal('n-1');
            expect(way.way_nodes.split(',')[0]).to.equal(node.object_id);
        }).then(done, done);
    });

    describe('#node', function() {
        it('should edit a node', function(done) {
            var dir = cs.edit.node1;
            new wiki.Diff().run(dir).then(function(d) {
                assert(d.success, d.message);
                return Node.find(d.object_id);
            }).then(function(nodes) {
                expect(nodes).to.not.be.empty;
                expect(nodes[0].longitude).to.equal(dir.geometry[0]+'');
            }).then(done, done);
        });
        it('should add a node', function(done) {
            var dir = cs.add.node1;
            new wiki.Diff().run(dir).then(function(d) {
                assert(d.success, d.message);
                expect(d.object_id).to.not.equal(dir.object_id);
                newId = d.object_id;
                return Node.find(d.object_id);
            }).then(function(nodes) {
                expect(nodes[0].longitude).to.equal(dir.geometry[0]+'');
            }).then(done, done);
        });
        it('shouldn\'t add a bad node', function(done) {
            var dir = cs.add.badNode;
            new wiki.Diff().run(dir).then(function(d) {
                expect(d.invalid).to.be.true;
            }).then(done, done);
        });
        it('should add wayNode relation', function(done) {
            var dir = cs.add.node3;
            new wiki.Diff().run(dir).then(function(d) {
                assert(d.success, d.message);
                return Way.getNodes(1);
            }).then(function(nodes) {
                expect(nodes[0].longitude).to.equal(dir.geometry[0]+'');
            }).then(done, done);
        });
        it('should delete a node', function(done) {
            var dir = { action: 'delete', object:'node', object_id:newId };
            new wiki.Diff().run(dir).then(function(d) {
                assert(d.success, d.message);
                return Node.find(d.object_id);
            }).then(function(nodes) {
                expect(nodes).to.be.empty;
            }).then(done, done);
        });
    });

    describe('#way', function() {
        var way1;
        it('should edit a way', function(done) {
            new wiki.Diff().run({
                action: 'edit', object: 'way',
                object_id: '1',
                way_nodes: ['0-1','1-2']
            }).then(function(d) {
                assert(d.success, d.message);
                return Way.getNodes(d.object_id);
            }).then(function(nodes) {
                expect(nodes[1].id).to.equal('2');
            }).then(done, done);
        });
        it('should add a way', function(done) {
            wiki.parse([
                cs.add.node1, cs.add.node2,
                cs.add.way1
            ]).then(function(drs) {
                assert(drs[drs.length-1].success, drs[drs.length-1].message);
                way1 = drs[2];
                return Way.getNodes(drs[2].object_id);
            }).then(function(nodes) {
                expect(nodes[0].longitude).to.equal(cs.add.node1.geometry[0]+'');
                expect(nodes[1].longitude).to.equal(cs.add.node2.geometry[0]+'');
            }).then(done, done);
        });
        it('should delete a way', function(done) {
            var dir = {
                action: 'delete', object: 'way',
                object_id: way1.object_id,
                way_nodes: '0,1'
            };
            new wiki.Diff().run(dir).then(function(d) {
                assert(d.success, d.message);
                return Way.getNodes(d.object_id);
            }).then(function(nodes) {
                expect(nodes).to.be.empty;
                delete dir.way_nodes;
                return new wiki.Diff().run(dir);
            }).then(function(d) {
                assert(d.success, d.message);
                return Way.find(d.object_id).then(function(w) {
                    expect(w).to.be.empty;
                });
            })
            .then(done, done);
        });
    });

    describe('#shape', function() {
        var node1, shape1;
        it('should add a shape', function(done) {
            wiki.parse([
                cs.add.node1, cs.add.node2,
                cs.add.way1, cs.add.shape1
            ]).then(function(drs) {
                assert(drs[drs.length-1].success, drs[drs.length-1].message);
                node1 = drs[0]; shape1 = drs[3];
                return Shape.getNodes({ shapes: drs[3].object_id });
            }).then(function(nodes) {
                node1 = _.find(nodes, { node: node1.object_id });
                expect(node1.lon).to.equal(cs.add.node1.geometry[0]+'');
            }).then(done, done);
        });
        it('should edit a shape', function(done) {
            cs.edit.shape1.object_id = shape1.object_id;
            new wiki.Diff().run(cs.edit.shape1).then(function(d) {
                assert(d.success, d.message);
                return Shape.find(d.object_id);
            }).then(function(shapes) {
                expect(shapes[0].data.name).to.equal(cs.edit.shape1.data.name);
                expect(shapes[0].data.one).to.equal(cs.add.shape1.data.one);
            })
            .then(done, done);
        });
        it('should delete a shape', function(done) {
            var dir = {
                action: 'delete', object: 'shape',
                object_id: shape1.object_id,
                shape_relations: shape1.shape_relations+
                    ','+cs.edit.shape1.shape_relations[0]
            };
            // (1) delete relations
            new wiki.Diff().run(dir).then(function(d) {
                assert(d.success, d.message);
                delete dir.shape_relations;
            // (2) delete shape
                return new wiki.Diff().run(dir);
            }).then(function(d) {
                assert(d.success, d.message);
                return Shape.get(dir.object_id);
            }).then(function(shape) {
                expect(shape.properties).to.be.null;
                expect(shape.objects).to.be.empty;
            }).then(done, done);
        });
    });

    describe('#level', function() {
        var Level = require('../models/Level');
        var dir = cs.add.level
        it('should add a level', function(done) {
            new wiki.Diff().run(dir).then(function(d) {
                assert(d.success, d.message);
                dir.object_id = d.object_id;
                return Level.find(d.object_id);
            }).then(function(lvls) {
                expect(lvls).to.have.length(1);
                expect(lvls[0]).to.have.property('name', dir.data.name);
            }).then(done, done);
        });
        it('should fail with incorrect input', function(done) {
            delete dir.data.name;
            new wiki.Diff().run(dir).then(function(d) {
                expect(d.success).to.be.false;
                expect(d.message).to.have.string('empty');
            }).then(done, done);
        });
        it('should edit a level', function(done) {
            dir.action = 'edit';
            dir.data.name = 'admin-1';
            new wiki.Diff().run(dir).then(function(d) {
                assert(d.success, d.message);
                return Level.find(d.object_id);
            }).then(function(lvls) {
                expect(lvls[0]).to.have.property('name', dir.data.name);
            }).then(done, done);
        });
        it('should delete a level', function(done) {
            dir.action = 'delete';
            new wiki.Diff().run(dir).then(function(d) {
                expect(d.message).to.have.string('not allowed');
                /*assert(d.success, d.message);
                return Level.find(dir.object_id);
            }).then(function(lvls) {
                expect(lvls).to.be.empty;*/
            }).then(done, done);
        });
    });

    describe('#type', function() {
        var Type = require('../models/Type');
        var dir = cs.add.type
        it('should add a type', function(done) {
            new wiki.Diff().run(dir).then(function(d) {
                assert(d.success, d.message);
                dir.object_id = d.object_id;
                return Type.find(d.object_id);
            }).then(function(types) {
                expect(types).to.have.length(1);
                expect(types[0]).to.have.property('name', dir.data.name);
            }).then(done, done);
        });
        it('should fail with incorrect input', function(done) {
            delete dir.data.name;
            new wiki.Diff().run(dir).then(function(d) {
                expect(d.success).to.be.false;
                expect(d.message).to.have.string('empty');
            }).then(done, done);
        });
        it('should edit a type', function(done) {
            dir.action = 'edit';
            dir.data.name = 'road';
            new wiki.Diff().run(dir).then(function(d) {
                assert(d.success, d.message);
                return Type.find(d.object_id);
            }).then(function(types) {
                expect(types[0]).to.have.property('name', dir.data.name);
            }).then(done, done);
        });
        it('should delete a type', function(done) {
            dir.action = 'delete';
            new wiki.Diff().run(dir).then(function(d) {
                expect(d.message).to.have.string('not allowed');
                /*assert(d.success, d.message);
                return Type.find(dir.object_id);
            }).then(function(lvls) {
                expect(lvls).to.be.empty;*/
            }).then(done, done);
        });
    });

    describe('#source', function() {
        var Source = require('../models/Source');
        var dir = cs.add.source
        it('should add a source', function(done) {
            new wiki.Diff().run(dir).then(function(d) {
                assert(d.success, d.message);
                dir.object_id = d.object_id;
                return Source.find(d.object_id);
            }).then(function(srcs) {
                expect(srcs).to.have.length(1);
                expect(srcs[0]).to.have.property('name', dir.data.name);
            }).then(done, done);
        });
        it('should fail with incorrect input', function(done) {
            delete dir.data.name;
            new wiki.Diff().run(dir).then(function(d) {
                expect(d.success).to.be.false;
                expect(d.message).to.have.string('empty');
            }).then(done, done);
        });
        it('should edit a source', function(done) {
            dir.action = 'edit';
            dir.data.name = 'nothing';
            new wiki.Diff().run(dir).then(function(d) {
                assert(d.success, d.message);
                return Source.find(d.object_id);
            }).then(function(srcs) {
                expect(srcs[0]).to.have.property('name', dir.data.name);
            }).then(done, done);
        });
        it('should delete a source', function(done) {
            dir.action = 'delete';
            new wiki.Diff().run(dir).then(function(d) {
                assert(d.success, d.message);
                return Source.find(dir.object_id);
            }).then(function(srcs) {
                expect(srcs).to.be.empty;
            }).then(done, done);
        });
    });

    describe('#period', function() {
        var Period = require('../models/Period');
        var dir = cs.add.period
        it('should add a period', function(done) {
            new wiki.Diff().run(dir).then(function(d) {
                assert(d.success, d.message);
                dir.object_id = d.object_id;
                return Period.find(d.object_id);
            }).then(function(pers) {
                expect(pers).to.have.length(1);
                expect(pers[0]).to.have.property('name', dir.data.name);
            }).then(done, done);
        });
        it('should fail with incorrect input', function(done) {
            delete dir.data.start_year;
            new wiki.Diff().run(dir).then(function(d) {
                expect(d.success).to.be.false;
                expect(d.message).to.have.string('empty');
            }).then(done, done);
        });
        it('should edit a period', function(done) {
            dir.action = 'edit';
            dir.data.start_year = 1986;
            new wiki.Diff().run(dir).then(function(d) {
                assert(d.success, d.message);
                return Period.find(d.object_id);
            }).then(function(pers) {
                expect(pers[0]).to.have.property('start_year', dir.data.start_year);
            }).then(done, done);
        });
        it('should delete a period', function(done) {
            dir.action = 'delete';
            new wiki.Diff().run(dir).then(function(d) {
                expect(d.message).to.have.string('not allowed');
                /*assert(d.success, d.message);
                return Period.find(dir.object_id);
            }).then(function(pers) {
                expect(pers).to.be.empty;*/
            }).then(done, done);
        });
    });
});

describe('#commit()', function() {
    // TODO: it('should update commit message', function(done) {});

    // TODO: it('should sort directives', function(done) {});

    // TODO: it('should record finished directives', function(done) {});
});

});
