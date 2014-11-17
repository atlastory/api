var _ = require('lodash'),
    Q = require('q'),
    pg = require('../services/db').pg,
    util = require('./utilities'),
    err = util.Err,
    geojsonhint = require('geojsonhint');

var Node = require('../models/Node'),
    Way = require('../models/Way'),
    Shape = require('../models/Shape'),
    Period = require('../models/Period'),
    Changeset = require('../models/Changeset'),
    dates = require('./dates');


// Normalizes GeoJSON properties to match Atlastory standards
exports.normalize = function(json) {
    if (json.type != 'FeatureCollection') return {};

    var keys = {
        'abbrev': 'name_sm',
        'sovereignt': 'sovereignty'
    };

    function replaceKeys(props) {
        var newJson = {}, newKey;
        for (var key in props) {
            newKey = key.toLowerCase();
            for (var old in keys) {
                if (newKey == old) newKey = keys[old];
            }
            newJson[newKey] = props[key];
        }
        return newJson;
    }

    function replaceValues(p) {
        //if (p.name) p._length = p.name.length;
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

/**
 * Imports a GeoJSON to the database (NWS format)
 * @param {object} options
 *        {object}  .geojson
 *        {number}  .period
 *        {number}  .type
 *        {number} [.source=1]
 *        {number} [.user=0]
 *        {string} [.message='Import of GeoJSON']
 *        {number} [.checkNode=2] check if nodes are duplicated: 0 = don't check; 1 = check duplicates; 2 = check all
 * @returns {number} changeset ID
 */
exports.import = function(options) {
    var geojson = options.geojson,
        period = parseFloat(options.period),
        type = options.type,
        source = options.source || 1,
        checkNode = (_.isNumber(options.checkNode)) ? options.checkNode : 2;

    if (isNaN(period) || typeof type !== 'number')
        return err.reject("'period' or 'type' ID missing");

    var sql = exports.getImportSql(options)+'';

    if (/--\sError/.test(sql)) return err.reject(sql, 'generating import sql');

    return pg.query(sql).then(function(cs) {
        cs = _.compact(_.pluck(cs, 'changeset_id'));
        return cs[0];
    })
    .catch(util.Err.catch('error executing SQL'));
};

/**
 * Generates raw SQL dump of a GeoJSON import
 * @param {object} options (same as #import() above)
 * @returns {string} SQL dump
 */
exports.getImportSql = function(options) {
    var geojson = options.geojson,
        period = parseFloat(options.period),
        type = options.type,
        source = options.source || 1,
        checkNode = (_.isNumber(options.checkNode)) ? options.checkNode : 2,
        Period = require('../models/Period');

    if (isNaN(period) || typeof type !== 'number') return '';

    var changeset = {
        user_id: options.user || 0,
        message: options.message || 'Import of GeoJSON',
        directives: []
    };

    // (1) Parse string & lint GeoJSON

    if (typeof geojson === 'string') geojson = JSON.parse(geojson);
    var geojsonErrors = geojsonhint.hint(JSON.stringify(geojson));
    if (geojsonErrors.length) {
        return pg.queue().add([
            '-- Error Importing GeoJSON:',
            '-- GeoJSON has ' + geojsonErrors.length + ' error(s)',
            '-- line ' + geojsonErrors[0].line + ': ' + geojsonErrors[0].message
        ].join('\n'));
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

    // Check each shape before generating SQL
    geojson.features.map(function(feature) {
        if (geojson.when) feature.when = geojson.when;
        feature.properties = _.extend(feature.properties, {
            periods: [period],
            type_id: type
        });
        return feature;
    }).forEach(function(feature) {
        sql += generateShapeSql(feature);
    });

    return pg.queue().add(sql);

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
    function generateShapeSql(feature) {
        var data = feature.properties,
            geom = feature.geometry,
            coords = geom.coordinates,
            esc = pg.engine.escape;

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
            if (_.isEmpty(coords)) return '';
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

        // Get period start/end to record in shape
        var newData = _.clone(data);
        if (feature.when) {
            var start = dates.parse(feature.when.start || ''),
                end = dates.parse(feature.when.stop || '');
            newData.start_year = start.year;
            newData.start_month = start.month;
            newData.start_day = start.day;
            newData.end_year = end.year;
            newData.end_month = end.month;
            newData.end_day = end.day;
        }
        if (!newData.start_year) {
            newData.start_year = [['('+Period.find(period).select('start_year')+')']];
            newData.start_month = [['('+Period.find(period).select('start_month')+')']];
            newData.start_day = [['('+Period.find(period).select('start_day')+')']];
        }
        if (!newData.end_year) {
            newData.end_year = [['('+Period.find(period).select('end_year')+')']];
            newData.end_month = [['('+Period.find(period).select('end_month')+')']];
            newData.end_day = [['('+Period.find(period).select('end_day')+')']];
        }

        // Create shape & update with new shape_id
        queue.add(Shape.create(newData)).add(Temp.update({
            shape_id: [['LASTVAL()']]
        }));

        // Finish shape relations
        queue.add(Shape.Relation.insert(Temp.all()).returning('shape_id'));

        var directive = Changeset.Directive._parseDirectives(changesetId, {
            action: 'add',
            object: 'shape',
            object_id: Temp.select('shape_id').limit(1),
            data: JSON.stringify(data),
            geometry: { type: geom.type }
        });
        queue.add(Changeset.Directive.insert(directive).returning('changeset_id'));

        return '\n\n-- ' + data.name + '\n' + queue.print();
    }
};


/**
 * Exports to GeoJSON
 * @param {object} options
 *        {(num|num[])} .shapes    Shape ID(s)
 *   or   {number}      .changeset Changeset ID
 *   or   {number}      .period    Period ID
 *   or   {(num|str)}   .year      Year shape is in
 *        {(num|num[])} [.type]    Type ID(s)
 *        {number[]}    [.bbox]    (west, south, east, north)
 *        {number}      [.detail=100%]
 *        {boolean}     [.withData=true]
 * @returns {object} GeoJSON
 */
exports.export = function(options) {
    var detail = options.detail || 1;
    var withData = (typeof options.withData === 'boolean') ? options.withData : true;
    var send = {
        shapes: options.shapes,
        changeset: parseFloat(options.changeset),
        period: options.period,
        year: parseFloat(options.year),
        type: _.isNumber(options.type) ? [options.type] : null,
        box: options.bbox || null
    };

    if (!send.shapes && isNaN(send.changeset) && !util.isBigint(send.period) && isNaN(send.year))
        return err.reject("needs shape, changeset, period or year", "exporting GeoJSON");
    _.each(send, function(v, k) {
        if (!v || isNaN(v)) delete send[k];
    });

    var cols = withData ? "*" : ["id"];

    var geoJSON = {
        "type": "FeatureCollection",
        "features": []
    };

    return Q.all([
        Shape.getData(send).select(cols),
        Shape.getNodes(send)
    ]).spread(function(data, nodes) {
        geoJSON.features = _(nodes).groupBy(function(node) {
            return node.shape;
        }).map(function(shape, id) {
            var props = _.find(data, { 'id': id });
            return {
                "type": "Feature",
                "properties": props ? props.toJSON() : {},
                "geometry": geometryFromNodes(shape),
                "when": dates.propsToWhen(props)
            };
        }).value();

        return geoJSON;
    }).catch(err.catch("exporting GeoJSON"));

    function geometryFromNodes(nodes) {
        var ways = _.groupBy(nodes, function(node) { return node.way; });
        ways = _.sortBy(ways, function(way) { return way[0].seq1; });

        var coords = [], type;
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
            coords = ways.map(function(way) {
                return parseWay(way);
            });

        } else if (outerCount > 1) {
            type = 'MultiPolygon';
            for (var i in ways) {
                var shape = parseWay(ways[i]);
                if (ways[i][0].role == 'inner') coords[coords.length-1].push(shape);
                else coords.push([shape]);
            }
        }

        return {
            "type": type,
            "coordinates": coords
        };
    }

    function parseWay(nodes) {
        var way = nodes.map(function(node) {
            return [parseFloat(node.lon), parseFloat(node.lat)];
        });

        // TODO: create nodes based on provided bbox

        // Make sure polys match first/last coords
        var role = nodes[0].role;
        if (role == 'inner' || role == 'outer') {
            if (way[0].toString() != way[way.length-1].toString())
                way.push(way[0]);
        }

        return way;
    }
};
