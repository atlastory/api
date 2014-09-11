var Type = require('../models/Type'),
    err = require('../lib/errors');


// GET /types
exports.index = function(req, res) {
    Type.all().then(function(types) {
        res.jsonp(types);
    }).fail(err.send(res));
};

// GET /types/:id
exports.show = function(req, res) {
    var id = req.param("id");

    var find = isNaN(parseFloat(id)) ?
        Type.where({ name: id }) :
        Type.find(id);

    find.then(function(types) {
        if (!types.length) return err.notFound(res)('Type '+id+' not found');
        res.jsonp(types[0]);
    }).fail(err.send(res));
};

//**********************************************
// TODO: Change to admin only \/

// POST /types
exports.create = function(req, res) {
    var type = Type.new({
        name: req.param("name"),
        level_id: req.param("level_id"),
        color_1: req.param("color_1"),
        color_2: req.param("color_2"),
    });

    type.save().then(function(types) {
        res.jsonp(types[0]);
    }).fail(err.invalid(res));
};

// PUT /types/:id
exports.update = function(req, res) {
    var id = parseFloat(req.param("id"));

    if (isNaN(id)) return err.invalid(res)('ID required');

    Type.find(id).then(function(type) {
        type = type[0];
        if (!type) return err.notFound(res)('Type '+id+' not found');

        return type.update({
            name: req.param("name"),
            level_id: req.param("level_id"),
            color_1: req.param("color_1"),
            color_2: req.param("color_2")
        }).save().run();
    }).then(function(type) {
        res.jsonp(type);
    }).fail(err.send(res));
};

// DELETE /types/:id
exports.destroy = function(req, res) {
    var id = parseFloat(req.param("id"));

    if (isNaN(id)) return err.invalid(res)('ID required');

    Type.find(id).then(function(types) {
        if (!types[0]) return err.notFound(res)('Type '+id+' not found');
        return types[0].remove().run();
    }).then(function(type) {
        res.jsonp(type);
    }).fail(err.send(res));
};
