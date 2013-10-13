var Changeset = require('../models/Changeset');

// GET /changeset/:id
exports.show = function(req, res) {
    var id = req.param("id");
    Changeset.get(id, function(err, changeset) {
        if (err) res.send(500, err);
        else res.jsonp(changeset);
    });
};

// POST /changeset
exports.create = function(req, res) {
    // Accepts { id: hash, directives: [] }

    var cs = req.body,
        hasDirectives = !(!cs.directives || !cs.directives.length);

    if (!cs.id && !hasDirectives) {
        res.send(500, 'Needs a changeset in form of {id:hash, directives:[]}');
    } else if (cs.id) {
        // Delete old changeset, then addDirectives()
        Changeset.where({changeset: cs.id}).remove(function(err) {
            if (err) res.send(500, err);
            else addDirectives();
        });
    } else {
        addDirectives();
    }

    function addDirectives() {
        var valid = true;
        var directives = cs.directives.map(function(d) {
            var model = Changeset.new(d);
            // TODO: validate = model.validate();
            return model;
        });

        Changeset.create(directives, cs.id, function(err, hash) {
            if (err) res.send(500, err);
            else res.jsonp({id: hash});
        });
    }
};

// DELETE /changeset/:id
exports.destroy = function(req, res) {
    var id = req.param("id");
    Changeset.where({changeset: id}).remove(function(err) {
        if (err) res.send(500, err);
        else res.send(200);
    });
};
