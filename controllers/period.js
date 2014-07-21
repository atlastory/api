var Period = require('../models/Period'),
    Type = require('../models/Type'),
    util = require('../lib/utilities'),
    err = util.Err;


// GET /periods
exports.index = function(req, res) {
    Period.all().then(function(periods) {
        res.jsonp(periods);
    }).fail(err.send(res));
};

// GET /periods/:id
exports.show = function(req, res) {
    var id = req.param("id");
    Period.find(id).then(function(period) {
        if (!period.length) return err.notFound(res)('Period '+id+' not found');
        res.jsonp(period[0]);
    }).fail(err.send(res));
};

//**********************************************
// TODO: Change to admin only \/

// POST /periods
exports.create = function(req, res) {
    var period = Period.new({
        name: req.param("name"),
        start_year: req.param("start_year"),
        end_year: req.param("end_year")
    });

    period.name = period.name || period.start_year + '-' + period.end_year;

    period.save().then(function(period) {
        period[0].id = parseFloat(period[0].id);
        res.jsonp(period[0]);
    }).fail(err.send(res));
};

// PUT /periods/:id
exports.update = function(req, res) {
    var id = parseFloat(req.param("id"));

    if (isNaN(id)) return err.invalid(res)('ID required');

    Period.find(id).then(function(period) {
        period = period[0];
        if (!period) return err.notFound(res)('Period '+id+' not found');

        return period.update({
            name: req.param("name"),
            start_year: req.param("start_year"),
            end_year: req.param("end_year")
        }).save().run();
    }).then(function(period) {
        res.jsonp(period);
    }).fail(err.send(res));
};

// DELETE /periods/:id
exports.destroy = function(req, res) {
    var id = parseFloat(req.param("id"));

    if (isNaN(id)) return err.invalid(res)('ID required');

    Period.find(id).then(function(period) {
        if (!period) return err.notFound(res)('Period '+id+' not found');
        return period[0].remove().run();
    }).then(function(period) {
        res.jsonp(period);
    }).fail(err.send(res));
};

///////////////////////////////////////////////

// GET /periods/:pid/:type.:format
exports.shapes = function(req, res, f) {
    var pid = req.param("pid") || req.param("period_id") || req.param("period"),
        type = req.param("type"),
        tid = parseFloat(req.param("type_id")),
        box = req.param("bbox"),
        format = req.param("format") || f;

    pid = parseFloat(pid);
    if (box) box = box.replace(/\s/g,'').split(',');
    if (!pid || isNaN(pid)) return err.invalid(res)("Need Period ID");
    if (isNaN(tid) && !type) return err.invalid(res)("Need type name or ID");
    if (box && box.length < 4) return err.invalid(res)("Box needs 2 points (x1, y1, x2, y2)");

    var ops = {
        zoom: parseFloat(req.param("z")),
        bbox: box || null
    };

    var funcs = {
        geojson: 'getGeoJSON',
        topojson: 'getTopoJSON',
        json: 'getShapeData'
    };

    if (isNaN(tid)) {
        // No type ID, need to look it up
        Type.where({ type: type }).then(function(types) {
            if (!types.length) return err.notFound(res)('Type "'+type+'" not found');
            ops.type = types.map(function(t) {
                return parseFloat(t.id);
            });
            return Period[funcs[format]](pid, ops);
        }).then(function(json) {
            res.jsonp(json);
        }).fail(err.send(res));
    } else {
        ops.type = tid;
        Period[funcs[format]](pid, ops).then(function(json) {
            res.jsonp(json);
        }).fail(err.send(res));
    }
};

// GET /geojson
exports.geojson = function(req, res) {
    return exports.shapes(req, res, "geojson");
};

// GET /topojson
exports.topojson = function(req, res) {
    return exports.shapes(req, res, "topojson");
};
