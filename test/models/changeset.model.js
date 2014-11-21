process.env.TEST = 'true';

var expect = require('chai').expect;

var Changeset = require('../../models/Changeset');

var directives = [ {
        action: 'add',
        object: 'shape',
        object_id: 1,
        data: {name: 'test', number: 8},
        shape_relations: '1-Way-outer-42'
    }, {
        action: 'edit',
        object: 'node',
        object_id: 550318,
        geometry: [62.671231, 8.081986]
} ];

var id;

describe('Changeset model', function() {
this.timeout(1000);

describe('#create()', function() {
    it('should create changeset with multiple directives', function(done) {
        Changeset.create({
            user_id: 1,
            message: 'test '+new Date(),
            status: 'start',
            directives: directives
        }).then(function(cs) {
            expect(cs).to.be.a('string');
            id = cs;
        }).then(done, done);
    });
});

describe('#get()', function() {
    it('should get a changeset', function(done) {
        Changeset.get(id).then(function(cs) {
            var d = cs.directives;
            expect(cs.status).to.equal('start');
            expect(d).to.be.instanceof(Array);
            expect(d[0].object_id).to.equal('1');
            expect(d[0].data.number).to.equal(8);
            expect(d[1].geometry[0]).to.equal(62.671231);
        }).then(done, done);
    });
});


});
