var _ = require('lodash'),
    Changeset = require('../models/Changeset'),
    Directive = require('../models/Directive'),
    wiki = require('../lib/wiki'),
    geojson = require('../lib/geojson'),
    err = require('../lib/errors');


// GET /changesets/:id(.:format)
exports.show = function(req, res) {
    var id = req.param("id");

    Changeset.get(id).then(function(changeset) {
        if (!changeset) return err.notFound(res)('Changeset #'+id+' not found');

        switch (req.param("format")) {
        case "txt":
            var txt = 'id: ' + changeset.id + '\n' +
                'user: ' + changeset.user_id + '\n' +
                'message: ' + changeset.message + '\n' +
                'created: ' + changeset.created_at + '\n' +
                'status: ' + changeset.status + '\n' +
                'finished: ' + changeset.finished_at + '\n' +
                'directives:\n' + changeset.directives.map(function(d) {
                    return '    ' + d.asString();
                }).join('\n');
            res.type('text/plain').send(txt);
            break;

        default:
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
        user = parseFloat(req.param("user_id")),
        csData = { message: message, user_id: user };

    // TODO: OAuth check
    if (id) {
        // Changeset already exists; update
        Changeset.find(id).thenOne(function(cs) {
            if (!cs) return err.notFound(res)('Changeset #'+id+' not found');
            return cs.update(csData).save().catch(err.invalid(res));
        }).then(function() {
            res.jsonp({
                id: id,
                response: 'Changeset updated'
            });
        }).fail(err.send(res));
    } else {
        var cs = Changeset.new(csData);
        cs.save().then(function(cs) {
            res.jsonp({
                id: cs[0].id,
                response: 'Changeset created'
            });
        }).fail(err.invalid(res));
    }
};

// DELETE /changesets/:id
/*exports.destroy = function(req, res) {
    var id = req.param("id");
    Changeset.remove(id).then(function() {
        res.send(200);
    }).fail(err.send(res));
};*/

// POST /changesets/:id/commit
// Accepts { message: '', directives: [] }
exports.commit = function(req, res) {
    var id = req.param("id"),
        data = req.body,
        chain, gjUpload;

    if (data.geojson) {
        if (typeof data.geojson === 'string')
            gjUpload = JSON.parse(data.geojson);
        else if (/Feature/.test(data.geojson.type)) gjUpload = data.geojson;
    } else if (req.files.geojson) {
        // TODO: change to readFile when inMemory=false
        gjUpload = req.files.geojson.buffer + '';
        gjUpload = JSON.parse(gjUpload);
    }

    // Commit normal directives
    if (!gjUpload) chain = wiki.commit(id, data);

    // Commit imported GeoJSON
    else chain = wiki.updateMessage(id, { message: data.message })
    // TODO: .then(geojson.upload: READ GEOJSON FILE UPLOAD)
    .then(function() {
        return geojson.import({
            geojson: gjUpload,
            period: data.period,
            type: data.type
        }, { id: id });
    })
    .then(function() {
        return wiki.updateStatus(id, true);
    })
    .then(function() {
        return Directive.changeset(id).map(wiki.mapToResponse);
    });

    chain.then(function(directives) {
        res.jsonp(directives);
    }).fail(err.send(res));
};
