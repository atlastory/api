var Layer = require('../models/Layer');


var getJSON = function(type, req, res) {
    var id = req.param("id"),
        pid = req.param("pid"),
        box = req.param("bbox"),
        z = req.param("z");
    if (box) box = box.split(',');

    if (!id) res.send(500, "Need Layer ID (id)");
    if (!pid) res.send(500, "Need Period ID (pid)");
    if (box && box.length < 4)
        res.send(500, "Box needs 2 points (x1, y1, x2, y2");

    var p1 = box ? [box[0], box[1]] : null;
    var p2 = box ? [box[2], box[3]] : null;

    if (type == 'geojson') type = 'getGeoJSON';
    if (type == 'topojson') type = 'getTopoJSON';

    Layer[type]({
        id: id,
        pid: pid,
        p1: p1,
        p2: p2,
        zoom: z
    }, function(err, geojson) {
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
