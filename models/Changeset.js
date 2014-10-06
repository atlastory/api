var Q = require('q'),
    pg = require('../services/db').pg,
    _ = require('lodash'),
    util = require('../lib/utilities'),
    err = util.Err;


var Changeset = module.exports = pg.model("changesets", {
    schema: {
        user_id:    { type: Number, allowNull: false },
        message:    String,
        created_at: Date
    }
});
var Directive = Changeset.Directive = require('./Directive');

Changeset.get = function(id) {
    return Q.all([
        Changeset.find(id),
        Directive.changeset(id)
    ]).then(function(res) {
        if (!res[0].length) return null;
        return {
            id: id,
            user_id: res[0][0].user_id,
            message: res[0][0].message,
            directives: res[1].map(function(d) { return d.toJSON(); }),
            created_at: res[0][0].created_at
        };
    });
};

Changeset.create = function(changeset) {
    var directives = changeset.directives || [];
    changeset = _.pick(changeset, _.keys(Changeset._schema));

    if (!changeset.user_id) return Q.reject(new Error('changeset needs user ID'));

    var csId;
    return Changeset.insert(changeset).then(function(cs) {
        csId = cs[0].id;
        return Directive.create(csId, directives);
    }).then(function() {
        return csId;
    }).catch(err.catch('creating changeset'));
};
