var Shape = require('../models/Shape'),
    err = require('../lib/errors'),
    util = require('../lib/utilities'),
    geojson = require('../lib/geojson');


// GET /shapes
exports.index = function(req, res) {
    var bbox = req.param("bbox");

    /*Shape.all().then(function(shapes) {
        res.jsonp(shapes);
    }).fail(err.send(res));*/
    err.forbidden(res)("Feature not available yet");
};

// GET /shapes/:id
exports.show = function(req, res) {
    var id = req.param("id");
    var format = req.param('format');

    if (/geojson|topojson/.test(format)) geojson.export({
        shapes: [id]
    }).then(function(gj) {
        if (!gj.features.length) return err.notFound(res)('Shape '+id+' not found');

        if (format == 'geojson') res.jsonp(gj.features[0]);
        else res.jsonp(util.convertTopoJSON(gj.features[0]));
    }).fail(err.send(res));

    else Shape.get(id).then(function(s) {
        res.jsonp(s);
    }).fail(err.send(res));
};

