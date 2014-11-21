var Q = require('q');
var _ = require('lodash');
var util = require('../utilities');

var Period = require('../../models/Period');

/**
 * >> exports.action (edit, add, delete):
 * 1) Validates directive
 * 2) Performs the action on the database
 * 3) Records any new ID with this.addId(old, new)
 * 4) Returns a promise with directive
 */
 module.exports = {
    edit: function(d) {
        return Period.find(d.object_id).thenOne(function(period) {
            if (!period) return Q.reject('period not found');
            period.update(d.data);
            return period.save();
        }).thenResolve(d);
    },
    add: function(d) {
        var diff = this;

        var period = Period.new(d.data);
        return period.save().then(function(periods) {
            diff.addId(d.object_id, periods[0].id);
        }).thenResolve(d);
    },
    delete: function(d) {
        d.invalid = false;
        d.message = 'delete not allowed for period';
        return Q(d);
        // return Period.remove(d.object_id).thenResolve(d);
    }
 };
