var Q = require('q');
var _ = require('lodash');
var util = require('../utilities');

var Level = require('../../models/Level');

/**
 * >> exports.action (edit, add, delete):
 * 1) Validates directive
 * 2) Performs the action on the database
 * 3) Records any new ID with this.addId(old, new)
 * 4) Returns a promise with directive
 */
 module.exports = {
    edit: function(d) {
        return Level.find(d.object_id).thenOne(function(lvl) {
            if (!lvl) return Q.reject('level not found');
            lvl.update(d.data);
            return lvl.save();
        }).thenResolve(d);
    },
    add: function(d) {
        var diff = this;

        var level = Level.new(d.data);
        return level.save().then(function(lvls) {
            diff.addId(d.object_id, lvls[0].id);
        }).thenResolve(d);
    },
    delete: function(d) {
        d.invalid = false;
        d.message = 'delete not allowed for level';
        return Q(d);
        // return Level.remove(d.object_id).thenResolve(d);
    }
 };
