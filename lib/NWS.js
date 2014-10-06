
// Utility for storing/retrieving nodes/ways/shapes

var _ = require('lodash');

var NWS = module.exports = function() {
    this.relations = [];
};

var fn = NWS.prototype;

var keys = ['type', 'id', 'role', 'sequence'];
var types = ['Node', 'Way', 'Shape'];
var roles = ['outer', 'inner', 'point', 'center', 'line'];

function lint(relation) {
    relation = _.pick(relation, keys);
    if (relation.id) {
        if (!Array.isArray(relation.id)) {
            relation.id = parseFloat(relation.id);
            if (isNaN(relation.id)) delete relation.id;
        }
    }
    if (relation.type) {
        var t = relation.type;
        t = relation.type = t.charAt(0).toUpperCase() + t.slice(1);
        if (!_.contains(types, t)) delete relation.type;
    }
    if (relation.role) {
        var r = relation.role;
        r = relation.role = r.toLowerCase();
        if (!_.contains(roles, r)) delete relation.role;
    }
    if (relation.sequence) {
        relation.sequence = parseFloat(relation.sequence);
        if (isNaN(relation.sequence)) delete relation.sequence;
    }
    return relation;
}

fn.add = function(relation) {
    relation = lint(relation);
    this.relations.push(relation);
    return relation;
};

fn.addNodes = function(relations) {
    relations = relations.map(function(rel) {
        return _.defaults(lint(rel), {
            type: 'Node',
            role: 'point'
        });
    });
    this.relations = this.relations.concat(relations);
    return relations;
};

fn.addWays = function(relations) {
    if (!Array.isArray(relations)) relations = [relations];
    relations = relations.map(function(rel) {
        return _.defaults(lint(rel), {
            type: 'Way',
            role: 'outer'
        });
    });
    this.relations = this.relations.concat(relations);
    return relations;
};

fn.getRelations = function() {
    return this.relations;
};
