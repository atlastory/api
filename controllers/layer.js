var Layer = require('../models/Layer');

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

var getJSON = function(type, req, res) {
    var id = parseFloat(req.param("id")),
        ops = {
            pid: parseFloat(req.param("pid")),
            z: parseFloat(req.param("z"))
        },
        box = req.param("bbox");

    if (box) box = box.replace(/\s/g,'').split(',');
    if (!id || isNaN(id)) res.send(500, "Need Layer ID (id)");
    if (!ops.pid || isNaN(ops.pid)) res.send(500, "Need Period ID (pid)");
    if (box && box.length < 4)
        res.send(500, "Box needs 2 points (x1, y1, x2, y2)");

    ops.p1 = box ? [box[0], box[1]] : null;
    ops.p2 = box ? [box[2], box[3]] : null;

    if (type == 'geojson') type = 'getGeoJSON';
    if (type == 'topojson') type = 'getTopoJSON';

    Layer.find(id, function(err, layer) {
        if (err) res.send(500, err);
        else layer[type](ops, function(err, geojson) {
            if (err) res.send(500, err);
            else res.jsonp(geojson);
        });
    });
};

// GET /layers/:id/geojson
// GET /geojson
exports.geojson = function(req, res) {
    return getJSON("geojson", req, res);
};

// GET /layers/:id/topojson
// GET /topojson
exports.topojson = function(req, res) {
    return getJSON("topojson", req, res);
};
