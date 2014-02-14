
// Utility for storing/retrieving nodes/ways/shapes

var NWS = module.exports = function() {
    this.nodes = [];
    this.ways = [];
    this.shapes = [];
};

var fn = NWS.prototype;

fn.addNodes = function(ids) {
    this.nodes = this.nodes.concat(ids);
};

fn.addWays = function(ids) {
    if (typeof ids === 'number') this.ways.push(ids);
    else if (Array.isArray(ids)) this.ways = this.ways.concat(ids);
};

fn.getShapes = function() {
    return {
        nodes: this.nodes,
        ways: this.ways,
        shapes: this.shapes
    };
};
