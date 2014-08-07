var _ = require('lodash'),
    util = require('./utilities'),
    Q = require('q'),
    Changeset = require('../models/Changeset');


exports.commit = function(id, changeset) {
    var directives = changeset.directives;
    if (!directives || !directives.length)
        return err.invalid(res)('Changeset needs at least 1 directive');

    // Get changeset +1
    // If !changeset.message && !message, error no message
    // Update with new message +2
    // Run directives
        // Check if directive is newest change +3
        // Store (-) placeholder IDs in {}
        // Run directive on DB (should be single query) +4
        // Replace placeholder ID with new ID
    // Add updated directives to DB +5

    // Get changeset & update commit message
    return Changeset.find(id).then(function(cs) {
        if (!cs.length) return Q.reject(util.err('Changeset #'+id+' not found'));
        if (cs[0].message === '' && !changeset.message) {
            return Q.reject(util.err('Changeset needs a commit message'));
        } else if (changeset.message) {
            return Changeset.update({ message: changeset.message }).run();
        } else return true;
    }).then(function() {
    // Run directives
        return util.promiseSeries(directives, exports.parse);
    }).then(function(newDirectives) {
    // Add updated directives to database
        directives = newDirectives;
        var record = _.reject(directives, function(d) {
            return (d.inConflict || d.invalid);
        });
        return Changeset.Directive.create(id, record).run();
    }).then(function() {
        return directives.map(exports.mapToResponse);
    });
};

exports.mapToResponse = function(d) {
    var status = 'success',
        response = '';

    if (d.invalid) {
        status = 'failed';
        response = d.response;
    } else if (d.inConflict) {
        status = 'failed';
        response = 'Newer change already commited';
    }

    d = Changeset.Directive.new(d);

    return {
        status: status,
        response: response,
        directive: d.asString()
    };
};

exports.checkConflict = function(directive) {
    // Single query to check if newer change already exists
    // Return promise
    return Q(false);
};

var Diff = function() {
    // "(-) placeholder ID" : "new database ID"
    this.ids = {};
    this.run = function(d) {
        return this[d.object][d.action].bind(this)(d);
    };
};

exports.parse = function(directive) {
    var diff = new Diff();

    /*var validate = {};
    // TODO: validate: action, object, ...
    if (!_.isEmpty(validate)) {
        directive.invalid = true;
        directive.response = validate;
        return Q(directive);
    }*/

    return exports.checkConflict(directive).then(function(inConflict) {
        if (inConflict) directive.inConflict = true;
        else return diff.run(directive);
        return directive;
    });
};

Diff.prototype.addId = function(idOld, idNew) {
    this.ids[idOld] = idNew;
};

Diff.prototype.replaceIds = function(directive) {
    var ids = this.ids;
    ['object_id','way_nodes','shape_relations'].forEach(function(k) {
        var str = directive[k];
        if (!_.isString(str)) str = JSON.stringify(str);
        if (str) directive[k] = _(ids).reduce(function(str, idNew, idOld) {
            return str.replace(new RegExp(idOld,'g'), idNew);
        }, str);
    });
    return directive;
};

Diff.prototype.shape = {
    edit: function() {},
    add: function(d) {
        d = this.replaceIds(d);
        // TODO: if wayNodes/shapeRelations contain placeholder, return inConflict
        // TODO: execute directive
        this.addId(d.object_id, 88);
        d = this.replaceIds(d);
        return Q(d);
    },
    delete: function() {}
};
