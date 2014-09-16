var Q = require('q');
var util = require('../utilities');

var Node = require('../../models/Node');

/**
 * >> exports.action (edit, add, delete):
 * 1) Performs the action on the database
 * 2) Records the new ID with this.addId(old, new)
 * 3) Returns a promise
 */
module.exports = {
    edit: function(d) {},
    add: function(d) {
        var diff = this;
        // validate
        // TODO: execute directive
        diff.addId(d.object_id, '111111');
        return Q();
    },
    delete: function(d) {}
};
