var Layer = require('../models/Layer');


var getJSON = function(type, req, res) {
    var ops = {
            id: req.param("id"),
            pid: req.param("pid"),
            z: req.param("z")
        },
        box = req.param("bbox");

    if (box) box = box.replace(/\s/g,'').split(',');
    if (!ops.id)  res.send(500, "Need Layer ID (id)");
    if (!ops.pid) res.send(500, "Need Period ID (pid)");
    if (box && box.length < 4)
        res.send(500, "Box needs 2 points (x1, y1, x2, y2)");

    ops.p1 = box ? [box[0], box[1]] : null;
    ops.p2 = box ? [box[2], box[3]] : null;

    if (type == 'geojson') type = 'getGeoJSON';
    if (type == 'topojson') type = 'getTopoJSON';

    Layer[type](ops, function(err, geojson) {
        if (err) res.send(500, err);
        res.send(JSON.stringify(geojson));
    });
};

exports.geojson = function(req, res) {
    return getJSON("geojson", req, res);
};

exports.topojson = function(req, res) {
    return getJSON("topojson", req, res);
};
