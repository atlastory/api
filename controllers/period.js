var Period = require('../models/Period'),
    postgis = require('../lib/postgis'),
    util = require('../lib/utilities');

// GET /layers/:lid/periods
exports.index = function(req, res) {
    var lid = req.param("lid");
    Period.all(lid, function(err, periods) {
        if (err) res.send(500, err);
        else res.jsonp(periods);
    });
};

// GET /layers/:lid/periods/:id
exports.show = function(req, res) {
    var pid = req.param("id");
    Period.find(pid, function(err, period) {
        if (err) res.send(500, err);
        else res.jsonp(period[0]);
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

// GET /layers/:id/periods/:pid/shapes.:type
exports.shapes = function(req, res, t) {
    var pid = req.param("pid"),
        type = req.param("type") || t,
        ops = { z: parseFloat(req.param("z")) },
        box = req.param("bbox");

    if (box) box = box.replace(/\s/g,'').split(',');
    if (!pid || isNaN(pid)) res.send(500, "Need Period ID");
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

    Period.find(pid, function(err, period) {
        if (err) res.send(500, err);
        else if (type == 'json') period[0].getShapeData(ops, send);
        else period[0][type](ops, send);
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
