var Q = require('q');
var _ = require('lodash');
var util = require('../utilities');

var Source = require('../../models/Source');

/**
 * >> exports.action (edit, add, delete):
 * 1) Validates directive
 * 2) Performs the action on the database
 * 3) Records any new ID with this.addId(old, new)
 * 4) Returns a promise with directive
 */
 module.exports = {
    edit: function(d) {
        return Source.find(d.object_id).thenOne(function(source) {
            if (!source) return Q.reject('source not found');
            source.update(d.data);
            return source.save();
        }).thenResolve(d);
    },
    add: function(d) {
        var diff = this;

        var source = Source.new(d.data);
        return source.save().then(function(sources) {
            diff.addId(d.object_id, sources[0].id);
        }).thenResolve(d);
    },
    delete: function(d) {
        return Source.remove(d.object_id).thenResolve(d);
    }
 };
