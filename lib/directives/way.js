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
        // if directive has way_nodes, delete only way_nodes
        if (d.way_nodes) {
            var seqIds = (d.way_nodes || '').split(',');
            return Way.removeNodes(d.object_id, seqIds).thenResolve(d);
        }
        // otherwise delete entire way
        return Way.Node.where({ way_id: d.object_id }).limit(1)
        .thenOne(function(wn) {
            if (wn) {
                d.invalid = true;
                d.message = 'way has existing nodes (must delete first)';
                return d;
            }
            return Way.remove(d.object_id);
        }).thenResolve(d);
    }
};
