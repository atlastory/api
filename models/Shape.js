var postgis = require('../lib/postgis'),
    Layer = require('./Layer'),
    util = require('../lib/utilities');

function Shape() {}

var fn = Shape.prototype;

fn.find = function(layerId, id, type, callback) {
    if (typeof type === 'function') {
        callback = type;
        type = 'geojson';
    }

    if (!layerId && layerId !== 0) callback(new Error('No layer ID!'));
    else {
        // Gets data only
        if (type == 'json') postgis.getData({
            layer: layerId,
            shape: id
        }, function(err, shape) {
            if (err) callback(err);
            else callback(null, shape[0]);
        });
        // Gets data + geometry
        else Layer.find(layerId, function(err,layer) {
            if (err) callback(err);
            else postgis.getShapes({
                layer: layer.id,
                type: layer.shape,
                shape: id,
                geom: util.asGeoJSON("%g")
            }, function(err, shape) {
                if (err) callback(err);
                else {
                    shape = util.buildGeoJSON(shape);
                    if (type == 'topojson') shape = util.convertTopoJSON(shape);
                    callback(null, shape);
                }
            });
        });
    }
};

fn.create = function(layerId, data, callback) {};

fn.update = function(layerId, id, data, callback) {};

fn.remove = function(layerId, id, callback) {};

module.exports = new Shape();
