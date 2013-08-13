var atlastory = require('node-api'),
    Step = require('step'),
    gis = atlastory.gis;

function Shape() {}

var fn = Shape.prototype;

fn.find = function(layerId, id, callback) {
    atlastory.getShapes({
        layer: layerId,
        shape: id,
        geom: gis.asGeoJSON("%g")
    }, function(err, shapes, lyr) {
        if (err) callback(err);
        else callback(null, gis.buildGeoJSON(shapes));
    });
};

fn.create = function(layerId, data, callback) {};

fn.update = function(layerId, id, data, callback) {};

fn.remove = function(layerId, id, callback) {};

module.exports = new Shape();
