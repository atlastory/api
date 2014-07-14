var _ = require('lodash'),
    async = require('async'),
    pg = require('../db/db').pg,
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

exports.import = function(options, callback) {
    /* Imports a GeoJSON to the database (NWS format)
     *
     * geojson   OBJECT
     * period    INTEGER
     * type      INTEGER
     * source    INTEGER (default 1)
     * user      INTEGER (default 0)
     * message   STRING  (default 'Import of GeoJSON')
     * checkNode INT     (default 2) check if nodes are duplicated: 0 = don't check; 1 = check duplicates; 2 = check all
     */

    var geojson = options.geojson,
        period = parseFloat(options.period),
        type = options.type,
        source = options.source || 1,
        checkNode = (_.isNumber(options.checkNode)) ? options.checkNode : 2;

    if (isNaN(period) || typeof type !== 'number')
        return callback(util.err("'period' or 'type' ID missing"));

    var changeset = {
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

    // (3a) Start SQL dump

    var sql = '';
    var startSql = pg.queue();
    var tempData = _.uniqueId('data_');
    var Data = pg.model(tempData, { idAttribute: 'value' });
    startSql.add('CREATE TEMP TABLE ' + tempData + ' (' +
        'key varchar, ' +
        'value varchar' +
    ') ON COMMIT DROP')
         .add(Changeset.insert(_.omit(changeset, 'directives')))
         .add(Data.insert({ key: 'changeset', value: [['LASTVAL()']] }));
    var changesetId = [['('+Data.select('value::bigint').where({ key: 'changeset' })+')']];
    sql += startSql.print();

    // (3b) Parse each GeoJSON feature

    var duplicateNodes = util.getDuplicateNodes(geojson.features);

    // Run each bucket parallel, each feature serial
    async.each(geojson.features, importFeature, function(err) {
        if (!callback) return sql;

        pg.query(sql, function(err, cs) {
            if (err) return util.err(err, 'error executing SQL');
            callback(null, parseFloat(_.compact(_.pluck(cs, 'changeset_id'))[0]));
        });
    });

    function importFeature(feature, finishFeature) {
        var geom = feature.geometry;
        var data = feature.properties = _.extend(feature.properties, {
            periods: [period],
            type_id: type
        });

        // If shape exists, link to new period
        if (checkNode) checkExistingShape(data, function(id) {
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
            else addShapeSql(feature, finishFeature);
        });
        else addShapeSql(feature, finishFeature);
    }

    // Check if shape exists already
    function checkExistingShape(data, callback) {
        callback(null);
        // TODO: how to tell if it's the same shape w/o checking nodes?
        /*Shape.select('id').where({
            name: data.name,
            type_id: type
        }, function(err, shapes) {
            if (err) {
                console.error("Failed to check for checkNode shape: "+err);
                callback(null);
            } else if (shapes.length > 0) callback(parseFloat(shapes[0].id));
            else callback(null);
        });*/
    }

    // Maps nested coords into array of Way objects
    function getPolyWays(geom) {
        var coords = geom.coordinates;
        if (_.isNumber(coords[0][0])) coords = [coords];
        if (_.isNumber(coords[0][0][0])) coords = [coords];
        return _.flatten(coords.map(function(poly) {
            return poly.map(function(way, i) {
                var isInner = (i !== 0 && /Poly/.test(geom.type));
                var role = isInner ? 'inner' : 'outer';
                role = (/Line/.test(geom.type)) ? 'line' : role;
                return { coords: way, role: role };
            });
        }));
    }

    // Add feature to NWS structure using SQL dump
    function addShapeSql(feature, callback) {
        var data = feature.properties,
            geom = feature.geometry,
            coords = geom.coordinates,
            esc = pg.engine.escape,
            nws = new NWS();

        var nodeData = {
            source_id: source
        };

        var queue = pg.queue();

        // Create temporary table to store shape relations
        var temp = _.uniqueId('rels_');
        queue.add('CREATE TEMP TABLE '+temp+' (' +
            'shape_id bigint, ' +
            'relation_type nws_enum, ' +
            'relation_id bigint, ' +
            'relation_role varchar, ' +
            'sequence_id int' +
        ') ON COMMIT DROP');

        var Temp = pg.model(temp, { idAttribute: 'sequence_id' });

        // Points
        if (/Point/.test(geom.type)) {

            coords = _.isNumber(coords[0]) ? [coords] : coords;
            coords = _.compact(coords.map(function(node) {
                if (!util.verifyCoord(node)) return null;
                return 'create_node(' + [
                    esc(node[0]), esc(node[1]),
                    esc(nodeData.source_id), esc(nodeData.tile)
                ].join() + ')';
            })).map(function(cn, i) {
                return {
                    relation_type: 'Node',
                    relation_id: [[cn]],
                    relation_role: 'point',
                    sequence_id: i
                };
            });
            if (_.isEmpty(coords)) return callback(util.err('No valid nodes'));
            queue.add(Temp.insert(coords));

        // Lines & Polygons
        } else {

            // Create ways
            var ways = getPolyWays(geom);
            queue.add(Temp.insert(ways.map(function(way, seq) {
                return {
                    relation_type: 'Way',
                    relation_id: [['cw()']],
                    relation_role: way.role,
                    sequence_id: seq
                };
            })));

            // Create nodes, wayNodes
            queue.add(ways.map(function(way, seq) {
                // Remove invalid coords + convert to string
                way.coords = _.compact(way.coords.map(function(coord) {
                    return !util.verifyCoord(coord) ? null : coord;
                }));

                var duplicateIdxs = _.compact(way.coords.map(function(coord, i) {
                    if (_.contains(duplicateNodes, coord+'')) return i+1;
                    return null;
                }));

                way = [
                    checkNode,
                    'ARRAY' + JSON.stringify(way.coords),
                    duplicateIdxs.length ? 'ARRAY' + JSON.stringify(duplicateIdxs) : 'NULL',
                    esc(data.source_id),
                    '(SELECT relation_id FROM '+temp+' WHERE sequence_id = '+seq+')'
                ].join(',');

                return 'SELECT create_way_nodes(' + way + ') AS n';
            }));
        }

        // Create shape & update with new shape_id
        queue.add(Shape.create(data)).add(Temp.update({
            shape_id: [['LASTVAL()']]
        }));

        // Finish shape relations
        queue.add(Shape.Relation.insert(Temp.all()).returning('shape_id'));

        queue.add(Changeset.Directive.create(changesetId, {
            action: 'add',
            object: 'shape',
            object_id: Temp.select('shape_id').limit(1),
            data: JSON.stringify(data),
            geometry: geom.type
        }).returning('changeset_id'));

        sql += '\n\n-- ' + data.name + '\n' + queue.print();

        callback(null);
    }
};



///////////////////////////////////////////


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
