var pg = require('../db/db').pg,
    async = require('async'),
    _ = require('lodash'),
    util = require('../lib/utilities');


var Changeset = module.exports = pg.model("changesets", {
    schema: {
        user_id:    { type: Number, allowNull: false },
        message:    String,
        created_at: Date
    }
});
var Directive = Changeset.Directive = require('./Directive');

Changeset.get = function(id, callback) {
    async.parallel({ changeset: function(end) {
        Changeset.find(id, end);
    }, directives: function(end) {
        Directive.where({ changeset_id: id }, end);
    } }, function(err, res) {
        if (err) return callback(util.err(err, 'getting changeset'));
        if (!res.changeset.length) return callback(null, null);
        callback(null, {
            id: id,
            user_id: res.changeset[0].user_id,
            message: res.changeset[0].message,
            directives: res.directives,
            created_at: res.changeset[0].created_at
        });
    });
};
Changeset.get = util.addPromisesTo(Changeset.get);

Changeset.create = function(changeset, callback) {
    var directives = changeset.directives || [];
    changeset = _.pick(changeset, _.keys(Changeset._schema));

    if (!changeset.user_id) return callback('changeset needs user ID');

    Changeset.insert(changeset, function(err, cs) {
        if (err) return callback(util.err(err, "creating changeset"));
        Directive.create(parseFloat(cs[0].id), directives, callback);
    });
};
Changeset.create = util.addPromisesTo(Changeset.create);

