var Q = require('q');
var _ = require('lodash');
var util = require('../utilities');

var Way = require('../../models/Way');

/**
 * >> exports.action (edit, add, delete):
 * 1) Validates directive
 * 2) Performs the action on the database
 * 3) Records any new ID with this.addId(old, new)
 * 4) Returns a promise with directive
 */
module.exports = {
    edit: function(d) {
        var diff = this;

        var nodes = (d.way_nodes || '').split(',').map(function(node) {
            if (/-/.test(node)) return node.split('-');
            else return [0, node];
        });

        return util.promiseSeries(nodes, function(node) {
            return Way.addNodes(d.object_id, node[0], node[1]);
        }).thenResolve(d);
    },
    add: function(d) {
        var diff = this;

        var wayData = _.pick(d.data, _.keys(Way._schema));
        var nodeIds = (d.way_nodes || '').split(',').reduce(function(ids, id) {
            if (!id || /-/.test(id)) return ids;
            ids.push(id.trim());
            return ids;
        }, []);

        return Way.insert(_.extend(wayData, { id: [['DEFAULT']] }))
        .thenOne(function(way) {
            diff.addId(d.object_id, way.id);
            return Way.addNodes(way.id, 0, nodeIds);
        }).thenResolve(d);
    },
    delete: function(d) {
        var nodeIds = (d.way_nodes || '').split(',');

        var isSequential = _.every(nodeIds.reduce(function(last, seq) {
            if (last === false) return false;
            if (last === 0) return seq;
            if (last + 1 == seq) return last++;
            return false;
        }, 0));
        if (!isSequential) {
            d.invalid = false;
            d.response = 'wayNode sequence must be sequential'
            return Q(d);
        }

        return Way.removeNodes(d.object_id, nodeIds).thenResolve(d);
    }
};
