var Q = require('q');
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
    edit: function(d) {},
    add: function(d) {
        var diff = this;
        diff.addId(d.object_id, '2222');
        return Q(d);
    },
    delete: function(d) {}
};
