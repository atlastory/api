var async = require('async');

var NWS = require('./NWS'),
    Node = require('../models/Node'),
    Way = require('../models/Way'),
    Shape = require('../models/Shape');


// TODO: do a forEach first, checking every node againt
// all previous nodes; if no shared, add to new bucket;
// if shared, add to existing bucket; run all buckets
// in parallel

exports.import = function(geojson, share, callback) {
    if (typeof share === 'function') {
        callback = share;
        share = false;
    }

    var each = share ? async.eachSeries : async.each;

    each(geojson.features, function(feature, cb) {
        var geom = feature.geometry,
            nws = new NWS();

        switch (geom.type) {
        case "Point":
        case "MultiPoint":
            Node.create(geom.coordinates, function(err, ids) {
                if (err) cb("Point | MultiPoint > "+err);
                else {
                    nws.addNodes(ids);
                    Shape.finish(1, feature.properties, nws.getShapes(), cb);
                }
            });
            break;

        case "LineString":
            Way.create(geom.coordinates, function(err, id) {
                if (err) cb("LineString > "+err);
                else {
                    nws.addWays(id);
                    Shape.finish(1, feature.properties, nws.getShapes(), cb);
                }
            });
            break;

        case "Polygon":
        case "MultiLineString":
            async.map(geom.coordinates, Way.create, function(err, ids) {
                if (err) cb("Polygon | MultiLineString > "+err);
                else {
                    nws.addWays(ids);
                    Shape.finish(1, feature.properties, nws.getShapes(), cb);
                }
            });
            break;

        case "MultiPolygon":
            var map = function(polygon, callback) {
                // Doesn't account for polygon "holes"
                async.map(polygon, Way.create, function(err, ids) {
                    if (err) callback("Inner Polygons > "+err);
                    else {
                        nws.addWays(ids);
                        callback(null);
                    }
                });
            };
            async.each(geom.coordinates, map, function(err) {
                if (err) cb("MultiPolygon > "+err);
                else {
                    Shape.finish(1, feature.properties, nws.getShapes(), cb);
                }
            });
            break;
        }
    }, callback);
};


