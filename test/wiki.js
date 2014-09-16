process.env.TEST = 'true';

var expect = require('chai').expect;

var wiki = require('../lib/wiki');
var cs = require('./helpers/changeset');


describe('Wiki Parser', function() {

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

    // TODO: it('should edit a node', function(done) {});
    it('should add a node', function(done) {
        new wiki.Diff().run(cs.add.node1).then(function(d) {
            expect(d.object_id).to.not.equal(cs.add.node1.object_id);

        }).then(done, done);
    });
    // TODO: it('should delete a node', function(done) {});

    // TODO: it('should edit a way', function(done) {});
    // TODO: it('should add a way', function(done) {});
    // TODO: it('should delete a way', function(done) {});

    // TODO: it('should edit a shape', function(done) {});
    // TODO: it('should add a shape', function(done) {});
    // TODO: it('should delete a shape', function(done) {});

    // TODO: it('should edit a level', function(done) {});
    // TODO: it('should add a level', function(done) {});
    // TODO: it('should delete a level', function(done) {});

    // TODO: it('should edit a type', function(done) {});
    // TODO: it('should add a type', function(done) {});
    // TODO: it('should delete a type', function(done) {});

    // TODO: it('should edit a source', function(done) {});
    // TODO: it('should add a source', function(done) {});
    // TODO: it('should delete a source', function(done) {});
});

describe('#commit()', function() {
    // TODO: it('should update commit message', function(done) {});

    // TODO: it('should sort directives', function(done) {});

    // TODO: it('should record finished directives', function(done) {});
});

});
