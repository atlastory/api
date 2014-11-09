var Q = require('q');
var _ = require('lodash');
var util = require('../utilities');

var Shape = require('../../models/Shape');

function buildRelations(rels) {
    if (_.isString(rels)) rels = rels.split(',');
    return rels.map(function(rel) {
        rel = rel.split('-');
        return {
            sequence: rel[0],
            type: rel[1],
            id: rel[3],
            role: rel[2],
        };
    });
}

/**
 * >> exports.action (edit, add, delete):
 * 1) Validates directive
 * 2) Performs the action on the database
 * 3) Records any new ID with this.addId(old, new)
 * 4) Returns a promise with directive
 */
module.exports = {
    edit: function(d) {
        var run = Q();
        // edit shape data
        if (!_.isEmpty(d.data)) {
            run = Shape.update(d.object_id, d.data);
        }
        // edit shape_relations
        if (d.shape_relations) {
            run = run.then(function() {
                return Shape.connect(d.object_id, buildRelations(d.shape_relations));
            });
        }

        return run.thenResolve(d);
    },
    add: function(d) {
        var diff = this;

        var shape = Shape.new(d.data);
        var validate = shape.validate();
        if (!_.isEmpty(validate)) {
            d.invalid = true;
            d.response = validate;
            return Q(d);
        }

        return Shape.finish(d.data, buildRelations(d.shape_relations))
        .then(function(shapeId) {
            diff.addId(d.object_id, shapeId);
        }).thenResolve(d);
    },
    delete: function(d) {
        // if directive has shape_relations, delete only relations
        if (d.shape_relations) {
            var rels = buildRelations(d.shape_relations);
            return Shape.removeRelations(d.object_id, _.pluck(rels, 'sequence'))
            .thenResolve(d);
        }
        // otherwise delete entire shape
        return Shape.getRelations(d.object_id).then(function(rels) {
            if (!_.isEmpty(rels)) {
                d.invalid = true;
                d.response = 'shape has existing relations (must delete first)';
                return d;
            }
            return Shape.remove(d.object_id);
        }).thenResolve(d);
    }
};
