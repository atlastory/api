
// Utility for storing/retrieving nodes/ways/shapes

var _ = require('lodash');

var NWS = module.exports = function() {
    this.objects = [];
};

var fn = NWS.prototype;

fn.addNodes = function(objects) {
    objects = objects.map(function(obj) {
        return _.defaults(obj, {
            type: 'Node',
            role: 'point'
        });
    });
    this.objects = this.objects.concat(objects);
};

fn.addWays = function(objects) {
    if (!Array.isArray(objects)) objects = [objects];
    objects = objects.map(function(obj) {
        return _.defaults(obj, {
            type: 'Way',
            role: 'outer'
        });
    });
    this.objects = this.objects.concat(objects);
};

fn.getShapes = function() {
    return this.objects;
};
