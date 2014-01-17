var assert = require('assert');
var Step = require('step');
var fs = require('fs');

var Layer = require('../../models/Layer');

var lyr = 0,
    lName = "test",
    layer;

describe('Layer model', function() {

describe('#find()', function() {
    this.timeout(1000);
    it('should get a single layer', function(done) {
        Layer.find(lyr, function(err, l) {
            assert.ifError(err);
            l = l[0];
            assert.equal(l.id, lyr);
            assert.equal(l.table, 'l_'+lyr);
            layer = l;
            done();
        });
    });
});

describe('#all()', function() {
    this.timeout(1000);
    it('should get map layers', function(done) {
        Layer.all(1, function(err, layers) {
            assert.ifError(err);
            assert(layers.length > 0);
            done();
        });
    });
});

});
