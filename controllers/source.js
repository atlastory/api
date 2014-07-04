var Source = require('../models/Source'),
    util = require('../lib/utilities');


// GET /sources
exports.index = function(req, res) {
    Source.all().then(function(sources) {
        res.jsonp(sources);
    }).fail(function(err) {
        res.send(500, err)
    });
};

// GET /sources/:id
exports.show = function(req, res) {
    var id = req.param("id");
    Source.find(id).then(function(source) {
        res.jsonp(source[0]);
    }).fail(function(err) {
        res.send(500, err);
    });
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
    }).fail(function(err) {
        res.send(500, err);
    });
};

// PUT /sources/:id
exports.update = function(req, res) {
    var id = parseFloat(req.param("id"));
    var name = req.param("name");
    var sourceVal = req.param("source");

    if (isNaN(id)) return res.send(500, new Error('ID required'));

    Source.find(id).then(function(source) {
        source = source[0];
        if (!source) return res.send(500, new Error('Source not found'));

        if (name) source.name = name;
        if (sourceVal) source.source = sourceVal;

        return source.save().run();
    }).then(function(source) {
        res.jsonp(source);
    }).fail(function(err) {
        res.send(500, err);
    });
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
    }).fail(function(err) {
        res.send(500, err);
    });
};
