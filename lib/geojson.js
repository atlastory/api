var _ = require('underscore'),
    async = require('async'),
    util = require('./utilities');

var NWS = require('./NWS'),
    Node = require('../models/Node'),
    Way = require('../models/Way'),
    Shape = require('../models/Shape'),
    Changeset = require('../models/Changeset');


// TODO: do a forEach first, checking every node againt
// all previous nodes; if no shared, add to new bucket;
// if shared, add to existing bucket; run all buckets
// in parallel

exports.import = function(options, callback) {
    /* Imports a GeoJSON to the database (NWS format)
     *
     * geojson   OBJECT
     * period    INTEGER
     * user      INTEGER (default 0)
     * share     BOOLEAN (default false)
     */

    var geojson = options.geojson,
        period = options.period,
        user = options.user || 0,
        share = (typeof share === 'boolean') ? share : false,
        changeset = util.createHash(),
        each, properties;

    each = share ? async.eachSeries : async.each;

    each(geojson.features, function(feature, finishFeature) {
        var geom = feature.geometry,
            nws = new NWS(), data;

        // Create Changeset entry for feature
        async.waterfall([function(waterfall) {
            Changeset.create({
                user_id: user,
                action: 'add',
                object: 'shape',
                data: JSON.stringify(feature.properties),
                geometry: JSON.stringify(geom)
            }, changeset, waterfall);

        // Add feature to NWS structure
        }, function(hash, cid, waterfall) {
            data = _.extend(feature.properties, {
                period_id: period,
                changeset_id: cid
            });
            geom.changeset_id = cid;

            switch (geom.type) {
            case "Point":
            case "MultiPoint":
                Node.create(geom.coordinates, cid, function(err, ids) {
                    if (err) waterfall("Point | MultiPoint > "+err);
                    else {
                        nws.addNodes(ids);
                        Shape.finish(data, nws.getShapes(), waterfall);
                    }
                });
                break;

            case "LineString":
                Way.create(geom, function(err, id) {
                    if (err) waterfall("LineString > "+err);
                    else {
                        nws.addWays(id);
                        Shape.finish(data, nws.getShapes(), waterfall);
                    }
                });
                break;

            case "Polygon":
            case "MultiLineString":
                geom = geom.coordinates.map(function(way) {
                    return { coordinates: way, changeset_id: cid };
                });
                async.map(geom, Way.create, function(err, ids) {
                    if (err) waterfall("Polygon | MultiLineString > "+err);
                    else {
                        nws.addWays(ids);
                        Shape.finish(data, nws.getShapes(), waterfall);
                    }
                });
                break;

            case "MultiPolygon":
                geom = _.flatten(geom.coordinates.map(function(poly) {
                    return poly.map(function(innerPoly) {
                        return { coordinates: innerPoly, changeset_id: cid };
                    });
                }));
                async.map(geom, Way.create, function(err, ids) {
                    if (err) waterfall("MultiPolygon > "+err);
                    else {
                        nws.addWays(ids);
                        Shape.finish(data, nws.getShapes(), waterfall);
                    }
                });
                break;
            }

        }], finishFeature);

    }, callback);
};


exports.export = function(options, callback) {
    /* Exports to GeoJSON
     *
     * period    INTEGER
     * detail    INTEGER (default 100%)
     * withData  BOOLEAN (default true)
     */

    var period = options.period,
        detail = options.detail || 1,
        withData = (typeof options.withData === 'boolean') ? options.withData : true;

    var geoJSON = {
        "type": "FeatureCollection",
        "features": []
    };

    var cols = withData ? "*" : ["id", "name"];

    var shapes, shapeIds, relations, ids, features;

    function toFeatures(shapes, relations) {
        var features = [];
        shapes.forEach(function(shape) {
            var feature = {
                "type": "Feature",
                "properties": shape.toJSON()
            };
        });
        return features;
    }

    Shape.getNodes({
        period: period
    }, function(err, nodes) {
        if (err) return callback(err);
        shapes = _.groupBy(nodes, function(node) { return node.shape; });
        shapeIds = Object.keys(shapes);

        var features = [];

        shapeIds.forEach(function(id) {
            var relations = _.groupBy(shapes[id], function(node) { return node.way; });
            var geom = [], way, rNodes, node, relID, i;

            for (relID in relations) {
                rNodes = relations[relID];
                // TODO: integrate relation roles
                way = [];
                for (i=0; i < rNodes.length; i++) {
                    node = rNodes[i];
                    way.push([parseFloat(node.lon), parseFloat(node.lat)]);
                }
                geom.push(way);
            }

            features.push({
                "type": "Feature",
                "geometry": geom
            });
        });

        callback(null, features);
    });
};

