var Period = require('../models/Period'),
    Type = require('../models/Type'),
    err = require('../lib/errors'),
    dates = require('../lib/dates');


// GET /periods
exports.index = function(req, res) {
    Period.all().then(function(periods) {
        if (req.param("format") == 'html') {
            res.render('model/index', {
                title: 'Periods',
                columns: Object.keys(Period._schema),
                rows: periods
            });
        } else {
            res.jsonp(periods);
        }
    }).fail(err.send(res));
};

// GET /periods/:id
exports.show = function(req, res) {
    var id = req.param("id");
    Period.find(id).thenOne(function(period) {
        if (!period) return err.notFound(res)('Period '+id+' not found');
        if (req.param("format") == 'html') {
            res.render('model/show', {
                title: 'Periods',
                columns: Object.keys(period.toJSON()),
                item: period
            });
        } else {
            res.jsonp(period);
        }
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

    Period.find(id).thenOne(function(period) {
        if (!period) return err.notFound(res)('Period '+id+' not found');

        return period.update({
            name: req.param("name"),
            start_year: req.param("start_year"),
            end_year: req.param("end_year")
        }).save().catch(err.invalid(res));
    }).then(function(period) {
        res.jsonp(period);
    }).fail(err.send(res));
};

// DELETE /periods/:id
exports.destroy = function(req, res) {
    var id = parseFloat(req.param("id"));

    if (isNaN(id)) return err.invalid(res)('ID required');

    Period.find(id).thenOne(function(period) {
        if (!period) return err.notFound(res)('Period '+id+' not found');
        return period.remove();
    }).then(function(period) {
        res.jsonp(period);
    }).fail(err.send(res));
};

///////////////////////////////////////////////

var formats = {
    geojson: 'getGeoJSON',
    topojson: 'getTopoJSON',
    json: 'getShapeData'
};

// GET /year/:year/:type(.:format)
exports.year = function(req, res) {
    var year = req.param("year"),
        type = req.param("type"),
        box = req.param("bbox"),
        format = req.param("format") || 'json';

    if (box) box = box.replace(/\s/g,'').split(',');
    if (box && box.length < 4) return err.invalid(res)("Box needs 2 points (x1, y1, x2, y2)");

    var ops = {
        zoom: parseFloat(req.param("z")),
        bbox: box || null
    };

    Type.getFromTypeOrLevel(type).then(function(types) {
        if (!types.length) return err.notFound(res)('Type name "'+type+'" not found');
        ops.type = types.map(function(t) {
            return parseFloat(t.id);
        });
        return dates[formats[format]](year, ops);
    }).then(function(json) {
        res.jsonp(json);
    }).fail(err.send(res));
};

// GET /periods/:pid/:type(.:format)
exports.shapes = function(req, res, f) {
    var pid = req.param("pid") || req.param("period_id") || req.param("period"),
        type = req.param("type"),
        tid = parseFloat(req.param("tid") || req.param("type_id")),
        box = req.param("bbox"),
        format = req.param("format") || f || 'json';

    pid = parseFloat(pid);
    if (box) box = box.replace(/\s/g,'').split(',');
    if (!pid || isNaN(pid)) return err.invalid(res)("Need Period ID");
    if (isNaN(tid) && !type) return err.invalid(res)("Need type name or ID");
    if (box && box.length < 4) return err.invalid(res)("Box needs 2 points (x1, y1, x2, y2)");

    var ops = {
        zoom: parseFloat(req.param("z")),
        bbox: box || null
    };

    if (isNaN(tid) && isNaN(parseFloat(type))) {
        // No type ID, need to look it up
        Type.getFromTypeOrLevel(type).then(function(types) {
            if (!types.length) return err.notFound(res)('Type name "'+type+'" not found');
            ops.type = types.map(function(t) {
                return parseFloat(t.id);
            });
            return Period[formats[format]](pid, ops);
        }).then(function(json) {
            res.jsonp(json);
        }).fail(err.send(res));
    } else {
        ops.type = tid || parseFloat(type);
        Period[formats[format]](pid, ops).then(function(json) {
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
