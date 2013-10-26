var assert = require('assert');
var Step = require('step');
var db = require('../../db/db');
var shape = require('../../lib/shape');

var add = {
    layer: 0,
    period: 1,
    data: '{"name":"mocha","datestart":"8/8/150","a":1,"b":2}',
    type: 'Point,Point',
    geom_diff: '[8.88,8.88]'
};

describe('Shape parser', function() {

ShapeLayer = db.pg.setTable("l_0");

describe('#add()', function() {
    this.timeout(0);
    it('should add shape from directive', function(done) {
        Step(function() {
            shape.add(add, this);
        }, function(err, id) {
            assert.ifError(err);
            assert(typeof id === 'number');
            ShapeLayer.find(id, this);
        }, function(err, shape) {
            assert.ifError(err);
            assert.equal(shape[0].type, 'point');
            assert.equal(shape[0].name, 'mocha');
            db.Point.find(shape[0].shape, this);
        }, function(err, shape) {
            assert.ifError(err);
            assert.equal(shape[0].layers[0], 0);
            assert.equal(shape[0].periods[0], 1);
            assert.equal(shape[0].geom, "0101000020E6100000C3F5285C8FC22140C3F5285C8FC22140");
            done();
        });
    });
});

});
