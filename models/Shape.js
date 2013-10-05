var Postgis = require('../lib/Postgis'),
    Layer = require('./Layer'),
    gis = require('../lib/gis.utilities');

function Shape() {}

var fn = Shape.prototype;

fn.find = function(layerId, id, callback) {
    if (!layerId) callback(new Error('No layer ID!'));
    else Layer.find(layerId, function(err,layer) {
        if (err) callback(err);
        else Postgis.getShapes({
            table: layer.table,
            type: layer.shape,
            shape: id,
            geom: gis.asGeoJSON("%g")
        }, function(err, shapes, lyr) {
            if (err) callback(err);
            else callback(null, gis.buildGeoJSON(shapes));
        });
    });
};

fn.create = function(layerId, data, callback) {};

fn.update = function(layerId, id, data, callback) {};

fn.remove = function(layerId, id, callback) {};

module.exports = new Shape();
