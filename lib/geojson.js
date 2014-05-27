var _ = require('lodash'),
    async = require('async'),
    util = require('./utilities'),
    geojsonhint = require('geojsonhint');

var NWS = require('./NWS'),
    Node = require('../models/Node'),
    Way = require('../models/Way'),
    Shape = require('../models/Shape'),
    Changeset = require('../models/Changeset');


// Normalizes GeoJSON properties to match Atlastory standards
exports.normalize = function(json) {
    if (json.type != 'FeatureCollection') return {};

    function replaceKeys(props) {
        var newJson = {}, newKey;
        for (var key in props) {
            newKey = key.toLowerCase();
            if (newKey == 'abbrev') newKey = 'name_sm';
            if (newKey == 'sovereignt') newKey = 'sovereignty';

            newJson[newKey] = props[key];
        }
        return newJson;
    }

    function replaceValues(p) {
        if (p.name) p._length = p.name.length;
        if (p.type == 'Sovereign country') p.type = 'sovereignty';
        if (p.type == 'Country') p.type = 'country';
        return p;
    }

    json.features.forEach(function(f) {
        var p = f.properties;
        p = replaceKeys(p);
        p = replaceValues(p);
        f.properties = p;
    });

    return json;
};


exports.importSqlDump = function(options, callback) {
    // insert x ways: INSERT INTO ways (id) VALUES (DEFAULT) RETURNING id
    // insert x way nodes: INSERT INTO way_nodes (node_id,way_id,sequence_id) VALUES (create_node(1.1,1.1,1,NULL),1006,0), ... RETURNING sequence_id
    // insert shape: INSERT INTO shapes (type_id,periods,name,description,date_start,date_end,tags,data) VALUES (1,'{104}','multi poly',NULL,NULL,NULL,'{}','a => 55, _length => 10') RETURNING id
    // insert shape relations: INSERT INTO shape_relations (shape_id,relation_type,relation_id,relation_role,sequence_id) VALUES (52,'Way',1008,'outer',0), (52,'Way',1006,'inner',1), (52,'Way',1007,'outer',2) RETURNING sequence_id

    // insert changeset: INSERT INTO changesets (user_id,message) VALUES (1,'Import of GeoJSON') RETURNING id
    // insert directives: INSERT INTO directives (action,object,object_id,data,geometry,changeset_id,created_at) VALUES ('add','shape',52,'{\"name\":\"multi poly\",\"a\":55,\"_length\":10,\"periods\":[104],\"type_id\":1}','MultiPolygon',26,'2014-05-26 02:37:52') RETURNING id


};

exports.import = function(options, callback) {
    /* Imports a GeoJSON to the database (NWS format)
     *
     * geojson   OBJECT
     * period    INTEGER
     * type      INTEGER
     * source    INTEGER (default 1)
     * user      INTEGER (default 0)
     * message   STRING  (default 'Import of GeoJSON')
     * duplicate BOOLEAN (default true) duplicate shapes w identical names
     */

    var geojson = options.geojson,
        period = parseFloat(options.period),
        type = options.type,
        source = options.source || 1,
        duplicate = (typeof options.duplicate === 'boolean') ? options.duplicate : true,
        each, changeset;

    if (isNaN(period) || typeof type !== 'number')
        return callback(util.err("'period' or 'type' ID missing"));

    changeset = {
        user_id: options.user || 0,
        message: options.message || 'Import of GeoJSON',
        directives: []
    };

    // (1) Parse string & lint GeoJSON

    if (typeof geojson === 'string') geojson = JSON.parse(geojson);
    var geojsonErrors = geojsonhint.hint(JSON.stringify(geojson));
    if (geojsonErrors.length) {
        return callback(util.err({
            action: 'Importing GeoJSON',
            message: 'GeoJSON has ' + geojsonErrors.length + ' error(s)',
            details: 'line ' + geojsonErrors[0].line + ': ' + geojsonErrors[0].message
        }));
    }

    // (2) Normalize GeoJSON properties

    geojson = exports.normalize(geojson);

    // (3) Parse each GeoJSON feature

    var buckets = util.getShareBuckets(geojson.features);

    async.each(buckets, function(bucket, finishBucket) {
        async.eachSeries(bucket, exportFeature, finishBucket);
    }, createChangeset);

    function exportFeature(feature, finishFeature) {
        var geom = feature.geometry;
        var data = _.extend(feature.properties, {
            periods: [period],
            type_id: type
        });

        // If shape exists, link to new period
        if (!duplicate) checkExistingShape(data, function(id) {
            if (id) Shape.update(id, {
                periods: [['periods || ARRAY['+period+'::int8]']]
            }, function(err, res) {
                if (err) return finishFeature(util.err({message:"linking shape to new period", details:err}));
                changeset.directives.push({
                    action: 'link',
                    object: 'shape',
                    object_id: id,
                    data: period
                });
                finishFeature();
            });
            else addShape(data, geom, finishFeature);
        });
        else addShape(data, geom, finishFeature);

    };

    // Add Changeset & Directives to DB
    function createChangeset(err) {
        Changeset.create(changeset, function(errcs, cs, d) {
            if (err && errcs) callback(util.err({
                action: 'Importing GeoJSON',
                message: 'import and changeset record failed',
                details: err + ', ' + errcs,
                changeset: changeset
            }));
            else if (errcs) callback(util.err({
                action: 'Importing GeoJSON',
                message: 'changeset record failed',
                details: errcs,
                changeset: changeset
            }));
            else if (err) callback(util.err({
                action: 'Importing GeoJSON',
                message: 'import failed',
                details: err
            }));
            else callback(null, cs, d);
        });
    };

    // Check if shape exists already
    function checkExistingShape(data, callback) {
        Shape.select('id').where({
            name: data.name,
            type_id: type
        }, function(err, shapes) {
            if (err) {
                console.error("Failed to check for duplicate shape: "+err);
                callback(null);
            } else if (shapes.length > 0) callback(parseFloat(shapes[0].id));
            else callback(null);
        });
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
                return _.extend(_.clone(nodeData), data || {});
            }

            switch (geom.type) {
            case "Point":
            case "MultiPoint":
                var extend = newData();
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
            changeset.directives.push({
                action: 'add',
                object: 'shape',
                object_id: id,
                data: JSON.stringify(data),
                geometry: geom.type
            });
            next();
        }], callback);
    }
};


exports.export = function(options, callback) {
    /* Exports to GeoJSON
     *
     * period    INT
     * type      INT
     * detail    INTEGER (default 100%)
     * withData  BOOLEAN (default true)
     */

    var period = options.period,
        type = options.type,
        detail = options.detail || 1,
        withData = (typeof options.withData === 'boolean') ? options.withData : true;

    var cols = withData ? "*" : ["id", "name"];

    var geoJSON = {
        "type": "FeatureCollection",
        "features": []
    };

    async.parallel({ properties: function(done) {
        Shape.getData({ period: period, type: type }).select(cols, done);
    }, nodes: function(done) {
        Shape.getNodes({ period: period, type: type }, done);
    }}, function(err, res) {
        if (err) return callback(err);

        var shapes = _.groupBy(res.nodes, function(node) { return node.shape; });
        var shapeIds = Object.keys(shapes);

        shapeIds.forEach(function(id) {
            geoJSON.features.push({
                "type": "Feature",
                "properties": _.find(res.properties, { 'id': id }),
                "geometry": geometryFromNodes(shapes[id])
            });
        });

        callback(null, geoJSON);
    });

    function geometryFromNodes(nodes) {
        var ways = _.groupBy(nodes, function(node) { return node.way; });
        ways = _.sortBy(ways, function(way) { return way[0].seq1; });

        var coords = [],
            type, i, way, shape;

        var nodeCount = nodes.length;
        var wayCount = ways.length;
        var outerCount = _.filter(ways, function(w) { return w[0].role == 'outer'; }).length;
        var firstRole = nodes[0].role;

        if (!outerCount && nodeCount == 1) {
            type = 'Point';
            coords = [parseFloat(nodes[0].lon), parseFloat(nodes[0].lat)];

        } else if (!outerCount && nodeCount > 1 && wayCount == 1) {
            type = (firstRole == 'line') ? 'LineString' : 'MultiPoint';
            coords = parseWay(ways[0]);

        } else if (wayCount > 1 && firstRole == 'line' || outerCount == 1) {
            type = (outerCount == 1) ? 'Polygon' : 'MultiLineString';
            for (i in ways) {
                way = ways[i];
                coords.push(parseWay(way));
            }

        } else if (outerCount > 1) {
            type = 'MultiPolygon';
            for (i in ways) {
                way = ways[i];
                shape = parseWay(way);
                if (way[0].role == 'inner') coords[coords.length-1].push(shape);
                else coords.push([shape]);
            }
        }

        return {
            "type": type,
            "coordinates": coords
        };
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
        if (role == 'inner' || role == 'outer') {
            if (way[0].toString() != way[way.length-1].toString())
                way.push(way[0]);
        }
        return way;
    }
};

