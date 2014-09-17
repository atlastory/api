var Q = require('q');
var util = require('../utilities');

var Node = require('../../models/Node');

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
            d.response = 'invalid node location';
            return Q(d);
        }
        var newData = {};
        if (d.geometry) {
            newData.longitude = d.geometry[0];
            newData.latitude = d.geometry[1];
        }
        if (d.data && d.data.source_id) newData.source_id = d.data.source_id;

        return Node.update(d.object_id, newData).then(function() {
            return d;
        });
    },
    add: function(d) {
        var diff = this;
        if (!util.verifyCoord(d.geometry)) {
            d.invalid = true;
            d.response = 'invalid node location';
            return Q(d);
        }
        return Node.create(d.geometry, d.data).then(function(nodes) {
            diff.addId(d.object_id, nodes[0].id);
            return d;
        });
    },
    delete: function(d) {
        return Node.remove(d.object_id).then(function(nodes) {
            return d;
        });
    }
};
