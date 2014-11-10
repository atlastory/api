var Changeset = require('../models/Changeset'),
    wiki = require('../lib/wiki'),
    _ = require('lodash'),
    err = require('../lib/errors');


// GET /changesets/:id
exports.show = function(req, res) {
    var id = req.param("id");
    var asString = (req.param("format") == 'text');

    Changeset.get(id).then(function(changeset) {
        if (!changeset) return err.notFound(res)('Changeset #'+id+' not found');
        if (asString) {
            var txt = 'id: ' + changeset.id + '\n' +
                'user: ' + changeset.user_id + '\n' +
                'message: ' + changeset.message + '\n' +
                'created: ' + changeset.created_at + '\n' +
                'status: ' + changeset.status + '\n' +
                'directives:\n' + changeset.directives.map(function(d) {
                    return '    ' + d.asString();
                }).join('\n');
            res.type('text/plain').send(txt);
        } else {
            changeset.directives = changeset.directives.map(function(d) {
                return _.omit(d.toJSON(), ['id','changeset_id']);
            });
            res.jsonp(changeset);
        }
    }).fail(err.send(res));
};

// POST /changesets
// PUT /changesets/create
// PUT /changesets/:id
exports.create = function(req, res) {
    var id = req.param("id"),
        message = req.param("message"),
        user = req.param("user_id"),
        csData = { message: message, user_id: user };

    if (id) {
        // Changeset already exists; update
        Changeset.update(id, csData)
          //.then(function() { return addDirectives(id); })
          .fail(err.send(res));
    } else {
        Changeset.insert(csData)
          //.thenOne(function(c) { return addDirectives(c.id); })
          .fail(err.send(res));
    }
};

// DELETE /changesets/:id
/*exports.destroy = function(req, res) {
    var id = req.param("id");
    Changeset.remove(id).then(function() {
        res.send(200);
    }).fail(err.send(res));
};*/

// POST /changeset/:id/commit
// Accepts { message: '', directives: [] }
exports.commit = function(req, res) {
    var id = req.param("id"),
        body = req.body;

    wiki.commit(id, body).then(function(directives) {
        res.jsonp(directives);
    }).fail(err.send(res));
};
