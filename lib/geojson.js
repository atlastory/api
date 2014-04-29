var _ = require('lodash'),
    async = require('async'),
    util = require('./utilities'),
    geojsonhint = require('geojsonhint');

var NWS = require('./NWS'),
    Node = require('../models/Node'),
    Way = require('../models/Way'),
    Shape = require('../models/Shape'),
    Changeset = require('../models/Changeset');


// TODO: do a forEach first, checking every node againt
// all previous nodes; if no shared, add to new bucket;
// if shared, add to existing bucket; run all buckets
// in parallel
// util.getShareBuckets(features) => [bucket1, bucket2 ...]
// bucket1 = [feature, feature, feature ...]

exports.import = function(options, callback) {
    /* Imports a GeoJSON to the database (NWS format)
     *
     * geojson   OBJECT
     * period    INTEGER
     * type      INTEGER
     * source    INTEGER (default 1)
     * user      INTEGER (default 0)
     * share     BOOLEAN (default false)
     * duplicate BOOLEAN (default true) duplicate shapes w identical names
     */

    var geojson = options.geojson,
        period = options.period,
        type = options.type,
        source = options.source || 1,
        user = options.user || 0,
        share = (typeof options.share === 'boolean') ? options.share : false,
        duplicate = (typeof options.duplicate === 'boolean') ? options.duplicate : true,

        changeset = util.createHash(user),
        error = new util.Error({ action: 'importing GeoJSON' }),
        each;

    if (typeof period !== 'number' || typeof type !== 'number')
        return callback(error.throw("'period' or 'type' ID missing"));

    // Parse & lint GeoJSON
    if (typeof geojson === 'string') geojson = JSON.parse(geojson);
    var geojsonErrors = geojsonhint.hint(JSON.stringify(geojson));
    if (geojsonErrors.length) {
        return callback(error.throw({
            error: 'GeoJSON has ' + geojsonErrors.length + ' error(s)',
            message: 'line ' + geojsonErrors[0].line + ': ' + geojsonErrors[0].message
        }));
    }

    each = share ? async.eachSeries : async.each;

    each(geojson.features, function(feature, finishFeature) {
        var geom = feature.geometry;
        var data = _.extend(feature.properties, {
            periods: [period],
            type_id: type
        });

        // If shape exists, link to new period
        if (!duplicate) checkExistingShape(data, function(id) {
            if (id) async.parallel([function(next) {
                addDirective({
                    action: 'link',
                    object_id: id,
                    data: period
                }, next);
            }, function(next) {
                period = parseFloat(period);
                Shape.update(id, {
                    periods: [['periods || ARRAY['+period+'::int8]']]
                }, next);
            }], function(err, res) {
                if (err) return finishFeature(error.throw({err:"linking shape to new period", message:err}));
                else finishFeature();
            });
            else addShape(data, geom, finishFeature);
        });
        else addShape(data, geom, finishFeature);

    }, function(err) {
        if (err) callback(error.throw(err));
        else callback(null, changeset);
    });

    // Check if shape exists already
    function checkExistingShape(data, callback) {
        Shape.select('id').where({
            name: data.name,
            type_id: type
        }, function(err, shapes) {
            if (err) console.error("Failed to check for duplicate shape: "+err);
            else if (shapes.length > 0) callback(parseFloat(shapes[0].id));
            else callback(null);
        });
    }

    // Create Changeset entry for feature
    function addDirective(options, callback) {
        options = _.defaults(options, {
            user_id: user,
            action: 'add',
            object: 'shape'
        });
        Changeset.create(options, changeset, callback);
    }

    // Add feature to NWS structure
    function addShape(data, geom, callback) {
        async.waterfall([function(next) {
            var coords = geom.coordinates;
            var nws = new NWS();
            var nodeData = {
                source_id: source
            };

            // Maps nested coords into array of Way objects
            function getPolyWays() {
                if (_.isNumber(coords[0][0][0])) coords = [coords];
                return _.flatten(coords.map(function(poly) {
                    return poly.map(function(way, i) {
                        var isInner = (i != 0 && /Poly/.test(geom.type));
                        var role = isInner ? 'inner' : 'outer';
                        role = (/Line/.test(geom.type)) ? 'line' : role;
                        return { coords: way, role: role };
                    });
                }));
            }

            function finishShape(err, ways) {
                if (err) next(geom.type + ' > ' + err);
                else {
                    nws.addWays(ways);
                    Shape.finish(data, nws.getRelations(), next);
                }
            }

            function newData(data) {
                data = data || {};
                return _.extend(_.clone(nodeData), data);
            }

            switch (geom.type) {
            case "Point":
            case "MultiPoint":
                var extend = newData({});
                Node.create(coords, extend, function(err, nodes) {
                    if (err) next(geom.type + ' > ' + err);
                    else {
                        nws.addNodes(nodes);
                        Shape.finish(data, nws.getRelations(), next);
                    }
                });
                break;

            case "LineString":
                var extend = newData({ role: 'line' });
                Way.create(coords, extend, finishShape);
                break;

            case "Polygon":
            case "MultiLineString":
                async.map(getPolyWays(), function(way, nextWay) {
                    var extend = newData({ role: way.role });
                    Way.create(way.coords, extend, nextWay);
                }, finishShape);
                break;

            case "MultiPolygon":
                async.map(getPolyWays(), function(way, nextWay) {
                    var extend = newData({ role: way.role });
                    Way.create(way.coords, extend, nextWay);
                }, finishShape);
                break;
            }

        }, function(id, next) {
            addDirective({
                object_id: id,
                data: JSON.stringify(data),
                geometry: geom.type
            }, next);
        }], callback);
    }
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

        async.map(shapeIds, function(id, next) {
            id = parseFloat(id);
            parseShapeNodes(id, shapes[id], next);
        }, function(err, features) {
            if (err) return callback(err);
            else callback(null, features);
        });
    });

    function parseShapeNodes(id, nodes, finish) {
        var ways = _.groupBy(nodes, function(node) { return node.way; });

        // var outerCount = ...
        // if (!outerCount) point/multipoint/line/multiline
        // if (outerCount == 1) polygon
        // if (outerCount > 1) multipolygon

        var geom = [], i, way;
        for (i in ways) {
            way = ways[i];
            // if (way[0].role == 'inner')
            geom.push(parseWay(way));
        }

        finish(null, {
            "type": "Feature",
            "geometry": geom
        });
    }

    function parseWay(nodes) {
        var way = [],
            role = nodes[0].role,
            i, node;

        for (i=0; i < nodes.length; i++) {
            node = nodes[i];
            way.push([parseFloat(node.lon), parseFloat(node.lat)]);
        }
        // Make sure polys match first/last coords
        if (role != 'line') {
            if (way[0].toString() != way[way.length-1].toString())
                way.push(way[0]);
        }
        return way;
    }
};

