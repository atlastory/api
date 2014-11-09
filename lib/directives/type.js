var Q = require('q');
var _ = require('lodash');
var util = require('../utilities');

var Type = require('../../models/Type');

/**
 * >> exports.action (edit, add, delete):
 * 1) Validates directive
 * 2) Performs the action on the database
 * 3) Records any new ID with this.addId(old, new)
 * 4) Returns a promise with directive
 */
 module.exports = {
    edit: function(d) {
        return Type.find(d.object_id).thenOne(function(type) {
            if (!type) return Q.reject('type not found');
            d.data.level_id = parseFloat(d.data.level_id);
            type.update(d.data);
            return type.save();
        }).thenResolve(d);
    },
    add: function(d) {
        var diff = this;

        d.data.level_id = parseFloat(d.data.level_id);

        var type = Type.new(d.data);
        return type.save().then(function(types) {
            diff.addId(d.object_id, types[0].id);
        }).thenResolve(d);
    },
    delete: function(d) {
        d.invalid = false;
        d.message = 'delete not allowed for type';
        return Q(d);
        // return Type.remove(d.object_id).thenResolve(d);
    }
 };
