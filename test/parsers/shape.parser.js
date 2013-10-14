var assert = require('assert');
var shape = require('../../lib/shape');

var directives = [
  {
    layer: 64,
    period: 1,
    data: "",
    type: '["Test","Controller"]',
    geom_diff: '[[1,2,[0,0]]]'
  }
];

describe('Shape parser', function() {

describe('#add()', function() {
    this.timeout(0);
    it('should add shape from directive', function(done) {
        shape.add(function(err, id) {
            assert.ifError(err);
            done();
        });
    });
});

});
