var Q = require('q');
var _ = require('lodash');
var util = require('../utilities');

var Node = require('../../models/Node');
var Way = require('../../models/Way');
var Shape = require('../../models/Shape');

/**
 * >> exports.action (edit, add, delete):
 * 1) Validates directive
 * 2) Performs the action on the database
 * 3) Records any new ID with this.addId(old, new)
 * 4) Returns a promise with directive
 */
module.exports = {
    edit: function(d) {
        if (d.geometry && !util.verifyCoord(d.geometry)) {
            d.invalid = true;
            d.message = 'invalid node location';
            return Q(d);
        }
        var newData = {};
        if (d.geometry) {
            newData.longitude = d.geometry[0];
            newData.latitude = d.geometry[1];
        }
        if (d.data && d.data.source_id) newData.source_id = d.data.source_id;

        return Node.update(d.object_id, newData)
        .thenResolve(d);
    },
    add: function(d) {
        var diff = this;
        var run = Q();
        // add new node
        if (d.geometry) {
            if (!util.verifyCoord(d.geometry)) {
                d.invalid = true;
                d.message = 'invalid node location';
                return Q(d);
            }
            run = Node.create(d.geometry, d.data).then(function(nodes) {
                diff.addId(d.object_id, nodes[0].id);
                d.object_id = nodes[0].id;
            });
        }
        // add new wayNodes to a way as %SEQ-%WAY
        if (d.way_nodes) {
            var wn = d.way_nodes.split('-');
            run = run.then(function() {
                return Way.addNodes(wn[1], wn[0], d.object_id);
            });
        }

        return run.thenResolve(d);
    },
    delete: function(d) {
        // if node isn't connected to any ways or shapes, delete
        return Shape.Relation.select({ id: 'shape_id' }).where({
            relation_type: 'Node',
            relation_id: d.object_id
        }).union(
            Way.Node.select({ id: 'way_id' }).where({ node_id: d.object_id })
        ).then(function(res) {
            if (!_.isEmpty(res)) {
                d.invalid = true;
                d.message = 'node is used by other objects (must delete first)';
                return d;
            }
            return Node.remove(d.object_id)
        })
        .thenResolve(d);
    }
};
