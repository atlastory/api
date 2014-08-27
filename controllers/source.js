var Source = require('../models/Source'),
    err = require('../lib/errors');


// GET /sources
exports.index = function(req, res) {
    Source.all().then(function(sources) {
        res.jsonp(sources);
    }).fail(err.send(res));
};

// GET /sources/:id
exports.show = function(req, res) {
    var id = req.param("id");
    Source.find(id).then(function(sources) {
        if (!sources.length) return err.notFound(res)('Source '+id+' not found');
        res.jsonp(sources[0]);
    }).fail(err.send(res));
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
    }).fail(err.invalid(res));
};

// PUT /sources/:id
exports.update = function(req, res) {
    var id = parseFloat(req.param("id"));

    if (isNaN(id)) return err.invalid(res)('ID required');

    Source.find(id).then(function(source) {
        source = source[0];
        if (!source) return err.notFound(res)('Source '+id+' not found');

        return source.update({
            name: req.param("name"),
            source: req.param("source")
        }).save().run();
    }).then(function(source) {
        res.jsonp(source);
    }).fail(err.send(res));
};

// DELETE /sources/:id
exports.destroy = function(req, res) {
    var id = parseFloat(req.param("id"));

    if (isNaN(id)) return err.invalid(res)('ID required');

    Source.find(id).then(function(source) {
        if (!source) return err.notFound(res)('Source '+id+' not found');
        return source[0].remove().run();
    }).then(function(source) {
        res.jsonp(source);
    }).fail(err.send(res));
};
