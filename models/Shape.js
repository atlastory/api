var postgis = require('../lib/postgis'),
    Period = require('./Period'),
    util = require('../lib/utilities');

function Shape() {}

var fn = Shape.prototype;

fn.find = function(pid, id, type, callback) {
    if (typeof type === 'function') {
        callback = type;
        type = 'geojson';
    }

    if (!pid) callback(new Error('No period ID!'));
    else Period.find(pid, function(err,period) {
        if (err) callback(err);
        var ops = {
            layer: period[0].layer_id,
            shape: id,
            geom: util.asGeoJSON("%g")
        };

        if (type == 'json') postgis.getData(ops, function(err, shape) {
            if (err) callback(err);
            else callback(null, shape[0]);
        });
        else postgis.getShapes(ops, function(err, shape) {
            if (err) callback(err);
            else {
                shape = util.buildGeoJSON(shape);
                if (type == 'topojson') shape = util.convertTopoJSON(shape);
                callback(null, shape);
            }
        });
    });
};

fn.create = function(layerId, data, callback) {};

fn.update = function(layerId, id, data, callback) {};

fn.remove = function(layerId, id, callback) {};

module.exports = new Shape();
