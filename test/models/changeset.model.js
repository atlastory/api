var assert = require('assert');
var expect = require('chai').expect;

process.env.ENV_VARIABLE = 'test';
var Changeset = require('../../models/Changeset');

var directives = [ {
        action: 'add',
        object: 'shape',
        object_id: 1,
        data: {name: 'test', number: 8},
        shape_relations: [{way: 42}]
    }, {
        action: 'edit',
        object: 'node',
        object_id: 550318,
        geometry: [62.671231, 8.081986]
} ];

var id;

describe('Changeset model', function() {


describe('#create()', function() {
    this.timeout(1000);
    it('should create changeset with multiple directives', function(done) {
        Changeset.create({
            user_id: 1,
            message: 'test '+new Date(),
            directives: directives
        }, function(err, cs, dirs) {
            expect(err).to.be.null;
            expect(cs).to.be.a('number');
            expect(dirs).to.be.instanceof(Array);
            expect(dirs[0]).to.be.a('number');
            id = cs;
            done();
        });
    });
});

describe('#get()', function() {
    this.timeout(1000);
    it('should get a changeset', function(done) {
        Changeset.get(id, function(err, cs) {
            expect(err).to.be.null;
            var d = cs.directives;
            expect(d).to.be.instanceof(Array);
            expect(d[0].object_id).to.equal('1');
            expect(d[0].data.number).to.equal(8);
            expect(d[1].geometry[0]).to.equal(62.671231);
            done();
        });
    });
});


});
