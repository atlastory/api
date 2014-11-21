var Way = require('../models/Way'),
    err = require('../lib/errors'),
    util = require('../lib/utilities');


// GET /nodes
exports.index = function(req, res) {
    var bbox = req.param("bbox");

    /*Way.all().then(function(nodes) {
        res.jsonp(nodes);
    }).fail(err.send(res));*/
    err.forbidden(res)("Feature not available yet");
};

// GET /nodes/:id
exports.show = function(req, res) {
    var id = req.param("id");

    var way;
    Way.find(id).thenOne(function(w) {
        if (!w) throw err.notFound(res)('Way '+id+' not found');
        way = w.toJSON();
        return Way.getNodes(id);

    }).then(function(nodes) {
        var coords = nodes.map(function(node) {
            return [parseFloat(node.longitude), parseFloat(node.latitude)];
        });
        var type = (coords[coords.length-1].toString() == coords[0].toString()) ?
            'Polygon' : 'LineString';
        var geojson = {
            type: 'Feature',
            properties: way,
            geometry: { type: type, coordinates: coords }
        };

        switch (req.param('format')) {
        case 'geojson':
            res.jsonp(geojson);
            break;
        case 'topojson':
            res.jsonp(util.convertTopoJSON(geojson));
            break;
        default:
            way.nodes = nodes;
            res.jsonp(way);
        }
    }).fail(err.send(res));
};

