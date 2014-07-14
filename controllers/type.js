var Type = require('../models/Type'),
    util = require('../lib/utilities');

function send500(res) {
    return function(err) { res.send(500, util.err(err)); };
}

// GET /types
exports.index = function(req, res) {
    Type.all().then(function(types) {
        res.jsonp(types);
    }).fail(send500(res));
};

// GET /types/:id
exports.show = function(req, res) {
    var id = req.param("id");
    Type.find(id).then(function(types) {
        res.jsonp(types[0]);
    }).fail(send500(res));
};

//**********************************************
// TODO: Change to admin only \/

// POST /types
exports.create = function(req, res) {
    var type = Type.new({
        name: req.param("name"),
        type: req.param("type"),
        color1: req.param("color1"),
        color2: req.param("color2"),
    });

    type.save().then(function(types) {
        res.jsonp(types[0]);
    }).fail(send500(res));
};

// PUT /types/:id
exports.update = function(req, res) {
    var id = parseFloat(req.param("id"));

    if (isNaN(id)) return res.send(500, new Error('ID required'));

    Type.find(id).then(function(type) {
        type = type[0];
        if (!type) return res.send(500, new Error('Source not found'));

        return type.update({
            name: req.param("name"),
            type: req.param("type"),
            color1: req.param("color1"),
            color2: req.param("color2")
        }).save().run();
    }).then(function(type) {
        res.jsonp(type);
    }).fail(send500(res));
};

// DELETE /types/:id
exports.destroy = function(req, res) {
    var id = parseFloat(req.param("id"));

    if (isNaN(id)) return res.send(500, new Error('ID required'));

    Type.find(id).then(function(types) {
        if (!types[0]) res.send(500, new Error('Type not found'));
        return types[0].remove().run();
    }).then(function(type) {
        res.jsonp(type);
    }).fail(send500(res));
};
