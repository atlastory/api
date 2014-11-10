var Q = require('q'),
    pg = require('../services/db').pg,
    _ = require('lodash'),
    util = require('../lib/utilities'),
    err = util.Err;


var Changeset = module.exports = pg.model("changesets", {
    schema: {
        user_id:    { type: Number, allowNull: false },
        message:    String,
        status:     { type: function(s) {
            return _.contains(['start', 'done', 'failed'], s);
        }, default: 'start' },
        created_at: Date
    }
});
var Directive = Changeset.Directive = require('./Directive');

Changeset.get = function(id) {
    return Q.all([
        Changeset.find(id),
        Directive.changeset(id)
    ]).spread(function(changesets, directives) {
        if (!changesets.length) return null;
        return {
            id: id,
            user_id: changesets[0].user_id,
            message: changesets[0].message,
            status: changesets[0].status,
            directives: directives.map(function(d) { return d.toJSON(); }),
            created_at: changesets[0].created_at
        };
    });
};

Changeset.create = function(changeset) {
    var directives = changeset.directives || [];
    changeset = _.pick(changeset, _.keys(Changeset._schema));

    if (!changeset.user_id) return Q.reject(new Error('changeset needs user ID'));

    var cs = Changeset.new(changeset);

    var csId;
    return cs.save().then(function(cs) {
        csId = cs[0].id;
        return Directive.create(csId, directives);
    }).then(function() {
        return csId;
    }).catch(err.catch('creating changeset'));
};
