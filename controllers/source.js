var Source = require('../models/Source'),
    util = require('../lib/utilities');

function send500(res) {
    return function(err) { res.send(500, util.err(err)); };
}

// GET /sources
exports.index = function(req, res) {
    Source.all().then(function(sources) {
        res.jsonp(sources);
    }).fail(send500(res));
};

// GET /sources/:id
exports.show = function(req, res) {
    var id = req.param("id");
    Source.find(id).then(function(source) {
        res.jsonp(source[0]);
    }).fail(send500(res));
};

//**********************************************
// TODO: Change to admin only \/

// POST /sources
exports.create = function(req, res) {
    var source = Source.new({
        name: req.param("name"),
        source: req.param("source")
    });

    source.save().then(function(source) {
        res.jsonp(source[0]);
    }).fail(send500(res));
};

// PUT /sources/:id
exports.update = function(req, res) {
    var id = parseFloat(req.param("id"));

    if (isNaN(id)) return res.send(500, new Error('ID required'));

    Source.find(id).then(function(source) {
        source = source[0];
        if (!source) return res.send(500, new Error('Source not found'));

        return source.update({
            name: req.param("name"),
            source: req.param("source")
        }).save().run();
    }).then(function(source) {
        res.jsonp(source);
    }).fail(send500(res));
};

// DELETE /sources/:id
exports.destroy = function(req, res) {
    var id = parseFloat(req.param("id"));

    if (isNaN(id)) return res.send(500, new Error('ID required'));

    Source.find(id).then(function(source) {
        if (!source[0]) res.send(500, new Error('Source not found'));
        return source[0].remove().run();
    }).then(function(source) {
        res.jsonp(source);
    }).fail(send500(res));
};
