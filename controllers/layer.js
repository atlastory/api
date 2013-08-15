var Layer = require('../models/Layer');

// GET /map/:mid/layer
exports.index = function(req, res) {
    var mId = req.param("mid");
    Layer.all(mId, function(err, layers) {
        if (err) res.send(500, err);
        else res.json(layers);
    });
};

// GET /map/:mid/layer/:id
exports.show = function(req, res) {
    var id = req.param("id");
    Layer.find(id, function(err, layer) {
        if (err) res.send(500, err);
        else res.json(layer);
    });
};

// POST /map/:mid/layer/:id
// wiki model
// exports.create

// PUT /map/:mid/layer/:id
// wiki model
// exports.update

// DELETE /map/:mid/layer/:id
// wiki model
// exports.destroy

var getJSON = function(type, req, res) {
    var ops = {
            id: parseFloat(req.param("id")),
            pid: parseFloat(req.param("pid")),
            z: parseFloat(req.param("z"))
        },
        box = req.param("bbox");

    if (box) box = box.replace(/\s/g,'').split(',');
    if (!ops.id || isNaN(ops.id))   res.send(500, "Need Layer ID (id)");
    if (!ops.pid || isNaN(ops.pid)) res.send(500, "Need Period ID (pid)");
    if (box && box.length < 4)
        res.send(500, "Box needs 2 points (x1, y1, x2, y2)");

    ops.p1 = box ? [box[0], box[1]] : null;
    ops.p2 = box ? [box[2], box[3]] : null;

    if (type == 'geojson') type = 'getGeoJSON';
    if (type == 'topojson') type = 'getTopoJSON';

    Layer[type](ops, function(err, geojson) {
        if (err) res.send(500, err);
        if (req.param("callback")) res.jsonp(geojson);
        else {
            res.type('application/json');
            res.send(JSON.stringify(geojson));
        }
    });
};

// GET /map/:mid/layer/:id/geojson
// GET /geojson
exports.geojson = function(req, res) {
    return getJSON("geojson", req, res);
};

// GET /map/:mid/layer/:id/topojson
// GET /topojson
exports.topojson = function(req, res) {
    return getJSON("topojson", req, res);
};
