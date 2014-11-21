var Source = require('../models/Source'),
    err = require('../lib/errors');


// GET /sources
exports.index = function(req, res) {
    Source.all().then(function(sources) {
        if (req.param("format") == 'html') {
            res.render('model/index', {
                title: 'Sources',
                columns: Object.keys(sources[0]),
                rows: sources
            });
        } else {
            res.jsonp(sources);
        }
    }).fail(err.send(res));
};

// GET /sources/:id
exports.show = function(req, res) {
    var id = req.param("id");
    Source.find(id).thenOne(function(source) {
        if (!source) return err.notFound(res)('Source '+id+' not found');
        if (req.param("format") == 'html') {
            res.render('model/show', {
                title: 'Sources',
                columns: Object.keys(source.toJSON()),
                item: source
            });
        } else {
            res.jsonp(source);
        }
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
        }).save().catch(err.invalid(res));
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
        return source[0].remove();
    }).then(function(source) {
        res.jsonp(source);
    }).fail(err.send(res));
};
