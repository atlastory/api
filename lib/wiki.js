var _ = require('lodash'),
    util = require('./utilities'),
    Q = require('q'),
    pg = require('../services/db').pg,
    Changeset = require('../models/Changeset');

/**
 * 1) Updates changeset with new data
 * 2) Runs all directives on database
 * 3) Adds finalized directives to changeset
 * @param {number} id Changeset ID to commit
 * @param {{message: string, directives: Directive[]}} changeset A changeset object to commit
 * @returns {object[]} An array of reports on the final status of directives applied
 */
exports.commit = function(id, changeset) {
    var directives = changeset.directives;
    if (!directives || !directives.length)
        return err.invalid(res)('Changeset needs at least 1 directive');

    // Get changeset & update commit message
    return Changeset.find(id).then(function(cs) {
        if (!cs.length) return Q.reject(util.err('Changeset #'+id+' not found'));
        if (cs[0].message === '' && !changeset.message) {
            return Q.reject(util.err('Changeset needs a commit message'));
        } else if (changeset.message) {
            return Changeset.update({ message: changeset.message }).run();
        } else return true;
    })
    // Run directives
    .then(function() {
        // Sort into Nodes, Ways, Shapes
        directives = _([
            _.where(directives, { object: 'node' }),
            _.where(directives, { object: 'way' }),
            _.where(directives, { object: 'shape' }),
        ]).flatten();
        return exports.parse(directives);
    })
    // Add updated directives to changeset
    .then(function(newDirectives) {
        directives = newDirectives;
        var record = _.reject(directives, function(d) {
            return (!d || d.inConflict || d.invalid);
        });
        if (_.isEmpty(record)) return true;
        return Changeset.Directive.create(id, record).run();
    }).then(function() {
        return directives.map(exports.mapToResponse);
    });
};

// Maps a directive to finished response
exports.mapToResponse = function(d) {
    var status = 'success',
        response = '';

    if (!d) {
        return {
            status: 'failed',
            response: 'something went wrong with the directive parser'
        };
    } else if (d.invalid) {
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

// Checks if a more recent change was already commited
exports.checkConflict = function(directive) {
    var inConflict = false;
    // Single query to check if newer change already exists
    return Q(inConflict);
};

/**
 * Parses an array of directives
 * @param {Directive[]} directives An array of directive objects
 * @returns {Directive[]} Edited directive with final IDs
 * @todo Validate each directive before parsing (action, object ...)
 */
exports.parse = function(directives) {
    var diff = new Diff();

    var invalid = false;
    directives.forEach(function(d) {
        // validate each value
        //invalid = d.invalid = true;
        //d.response = '';
    });
    if (invalid) return Q(directives);

    return util.promiseSeries(directives, function(directive) {
        return exports.checkConflict(directive).then(function(inConflict) {
            if (inConflict) directive.inConflict = true;
            else return diff.run(directive);
            return directive;
        });
    });
};

/**
 * Diff class: reads directives and applies them to the database
 * 1) Store placeholder IDs in {}
 * 2) Run directive on DB (should be a single query)
 * 3) Replace placeholder ID with new ID
 */
var Diff = function() {
    // "(-) placeholder ID" : "new database ID"
    this.ids = {};
};

// Saves a new ID with its placeholder
Diff.prototype.addId = function(idOld, idNew) {
    this.ids[idOld] = idNew;
};

// Replaces placeholder IDs if a new one exists
Diff.prototype.replaceIds = function(directive) {
    var ids = this.ids;
    ['object_id','way_nodes','shape_relations'].forEach(function(k) {
        var str = directive[k];

        // Convert ['x','y'] >> 'x,y'
        if (_.isArray(str) && _.isString(str[0])) str = str.join(',');
        // Convert full-form shape relation >> "sequence-Type-role-id#"
        if (_.isArray(str) && str[0].relation_id) str = str.reduce(function(rels, rel) {
            rels.push([rel.sequence_id, rel.relation_type, rel.relation_role, rel.relation_id].join('-'));
            return rels;
        }, []).join(',');
        if (!_.isString(str)) str = JSON.stringify(str);

        if (str) directive[k] = _(ids).reduce(function(str, idNew, idOld) {
            return str.replace(new RegExp(idOld,'g'), idNew);
        }, str);
    });
    return directive;
};

// Runs the directive's specified action on an object
Diff.prototype.run = function(d) {
    var _this = this;
    d = this.replaceIds(d);
    return this[d.object][d.action].bind(this)(d).then(function() {
        return _this.replaceIds(d);
    });
};

/**
 * object name (node, way, shape, level, type, source, period)
 * +-- action (edit, add, delete):
 * 1) Performs the action on the database
 * 2) Records the new ID
 * 3) Returns a promise
 */

Diff.prototype.node = {
    edit: function(d) {},
    add: function(d) {
        var diff = this;
        diff.addId(d.object_id, '111111');
        return Q(d);
    },
    delete: function(d) {}
};

Diff.prototype.way = {
    edit: function(d) {},
    add: function(d) {
        this.addId(d.object_id, '222222');
        return Q(d);
    },
    delete: function(d) {}
};

Diff.prototype.shape = {
    edit: function(d) {},
    add: function(d) {
        // validate
        // TODO: execute directive
        this.addId(d.object_id, '333333');

        return Q(d);
    },
    delete: function(d) {}
};
