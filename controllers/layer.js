var Layer = require('../models/Layer'),
    postgis = require('../lib/postgis'),
    util = require('../lib/utilities');

// GET /layers
exports.index = function(req, res) {
    var mId = 1;
    Layer.all(mId, function(err, layers) {
        if (err) res.send(500, err);
        else res.jsonp(layers);
    });
};

// GET /layers/:id
exports.show = function(req, res) {
    var id = req.param("id");
    Layer.find(id, function(err, layer) {
        if (err) res.send(500, err);
        else res.jsonp(layer);
    });
};

// POST /layers/:id
// wiki model
// exports.create

// PUT /layers/:id
// wiki model
// exports.update

// DELETE /layers/:id
// wiki model
// exports.destroy

// GET /layers/:id/shapes.:type
exports.shapes = function(req, res, t) {
    var type = req.param("type") || t,
        ops = {
            lid: parseFloat(req.param("id")),
            pid: parseFloat(req.param("pid")),
            z: parseFloat(req.param("z"))
        },
        box = req.param("bbox");

    if (box) box = box.replace(/\s/g,'').split(',');
    if (!ops.lid && ops.lid!==0 || isNaN(ops.lid)) res.send(500, "Need Layer ID (id)");
    if (!ops.pid || isNaN(ops.pid)) res.send(500, "Need Period ID (pid)");
    if (box && box.length < 4)
        res.send(500, "Box needs 2 points (x1, y1, x2, y2)");

    ops.p1 = box ? [box[0], box[1]] : null;
    ops.p2 = box ? [box[2], box[3]] : null;

    if (type == 'geojson') type = 'getGeoJSON';
    if (type == 'topojson') type = 'getTopoJSON';

    function send(err, json) {
        if (err) res.send(500, err);
        else res.jsonp(json);
    }

    Layer.find(ops.lid, function(err, layer) {
        if (err) res.send(500, err);
        else if (type == 'json') layer.getShapeData(ops, send);
        else layer[type](ops, send);
    });
};

// GET /geojson
exports.geojson = function(req, res) {
    return exports.shapes(req, res, "geojson");
};

// GET /topojson
exports.topojson = function(req, res) {
    return exports.shapes(req, res, "topojson");
};
