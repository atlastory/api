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
        var completed = _.where(directives, { success: true });
        if (_.isEmpty(completed)) return true;
        return Changeset.Directive.create(id, completed).run();
    }).then(function() {
        return directives.map(exports.mapToResponse);
    });
};

// Maps a directive to finished response
exports.mapToResponse = function(d) {
    var status = '',
        response = '';

    if (!d) return {
        status: 'failed',
        response: 'Something went wrong with the directive parser'
    };

    var directive = Changeset.Directive.new(d);
    var res = { directive: directive.asString() };

    if (d.invalid) {
        res.status = 'failed';
        res.response = d.response;
    } else if (d.inConflict) {
        res.status = 'failed';
        res.response = 'Newer change already commited';
    } else if (d.success) {
        res.status = 'success';
    }

    return res;
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
        // object
        // action
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
var Diff = exports.Diff = function() {
    // "(-) placeholder ID" : "new database ID"
    this.ids = {};
    this.proceed = true;
};

// Saves a new ID with its placeholder
Diff.prototype.addId = function(idOld, idNew) {
    this.ids[idOld] = idNew;
};

// Replaces placeholder IDs if a new one exists
Diff.prototype.replaceIds = function(directive) {
    var ids = this.ids;
    directive = _.cloneDeep(directive);
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
    if (!this.proceed) return Q(d);

    d = this.replaceIds(d);
    return this[d.object][d.action].bind(this)(d).then(function(d) {
        if (d.invalid) _this.proceed = false;
        else d.success = true;
        return _this.replaceIds(d);
    });
};

// Adds objects from the ./objects folder
var objects = util.requireAll(__dirname + '/objects');
_.extend(Diff.prototype, objects);
