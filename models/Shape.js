var _ = require('lodash'),
    pg = require('../services/db').pg,
    util = require('../lib/utilities'),
    async = require('async'),
    hstore = require('hstore.js'),
    Q = require('q');


var Shape = module.exports = pg.model("shapes", {
    schema: {
        type_id: Number,
        periods: [Number],
        start_day:   { type: Number, default: 1 },
        start_month: { type: Number, default: 1 },
        start_year:  { type: Number },
        end_day:     { type: Number, default: 1 },
        end_month:   { type: Number, default: 1 },
        end_year:    { type: Number },
        tags: [Number],
        data: { type: 'hstore' }
    },
    getters: {
        data: function() {
            if (this.data)
                return hstore.parse(this.data, { numeric_check: true });
            else return null;
        }
    }
});
Shape.Relation = pg.model("shape_relations", { idAttribute: 'sequence_id' });
var Changeset = require('./Changeset');
var Directive = require('./Directive');


// Gets a single shape with associated nodes/ways
Shape.get = function(id, callback) {
    var d = Q.defer();
    var shape = {};
    id = parseFloat(id);
    if (isNaN(id)) return Q.reject(util.err('ID must be a number','getting shape'));

    async.parallel({ properties: function(cb) {
        Shape.find(id, cb);
    }, objects: function(cb) {
        Shape.getRelations(id, cb);
    }}, function(err, res) {
        if (err) return d.reject(util.err(err,'getting shape'));
        shape.properties = res.properties[0].toJSON();
        shape.objects = res.objects.map(function(rel) {
            return {
                type: rel.relation_type,
                id: rel.relation_id,
                role: rel.relation_role,
                sequence: rel.sequence_id
            };
        });
        d.resolve(shape);
    });

    return d.promise.nodeify(callback);
};

Shape.inChangeset = function(id, callback) {
    Directive.where({
        changeset_id: id,
        object: 'shape'
    }).select('object_id', function(err, ids) {
        if (err) callback('Error getting changeset shapes: '+err);
        else if (ids.length === 0) callback(null, []);
        else async.map(ids, function(directive, next) {
            Shape.get(directive.object_id, next);
        }, callback);
    });
};

Shape.getRelations = function(id, callback) {
    if (Array.isArray(id)) id = id.join(",");
    return Shape.Relation.where('shape_id IN ('+id+')').order('sequence_id', callback);
};

Shape.getData = function(options, callback) {
    /* Gets data for shape(s)
     *
     * shapes    INT|INT[]  ||
     * changeset INT        ||
     * period    INT        ||
     * year      INT
     * type      INT|INT[]  (optional)
     */
     var shapes = options.shapes,
        period = parseFloat(options.period),
        year = parseFloat(options.year),
        changeset = options.changeset,
        type = options.type;

    var where = [];

    if (_.isNumber(shapes)) shapes = [shapes];
    if (shapes) where.push("id IN (:shapes)");
    if (!isNaN(period)) where.push(":period = ANY (periods)");
      else if (!isNaN(year)) where.push("start_year <= :year AND end_year > :year");
    if (_.isNumber(changeset)) where.push("id IN (SELECT object_id FROM directives WHERE changeset_id = :changeset AND object = 'shape')");
    if (_.isNumber(type)) type = [type];
    if (_.isArray(type)) {
        type = [[type.join()]];
        where.push("type_id IN (:type)");
    }

    where = where.join(' AND ');

    return Shape.where(where, {
        shapes: shapes ? [[shapes.join()]] : '',
        period: period,
        year: year,
        changeset: changeset,
        type: type
    }).nodeify(callback);
};

Shape.getNodes = function(options, callback) {
    /* Gets all Nodes for a set of shapes
     *
     * shapes    INT|INT[]  ||
     * changeset INT        ||
     * period    INT        ||
     * year      INT
     * type      INT|INT[]  (optional)
     * box       ARRAY      [west, south, east, north]
     */
    var queue = pg.queue(),
        shapes = options.shapes,
        period = parseFloat(options.period),
        year = parseFloat(options.year),
        changeset = options.changeset,
        box = options.box;

    var type = _.isNumber(options.type) ?
            [options.type] :
            _.isArray(options.type) ? options.type : null,
        getType = (_.isArray(type));
    if (getType) type = [[type.join()]];

    var columns, query, where, order, boxq;

    columns = util.columnString({
        shape: "shape_relations.shape_id",
        way: "way_nodes.way_id",
        node: "nodes.id",
        role: "shape_relations.relation_role",
        lat: "nodes.latitude",
        lon: "nodes.longitude",
        seq1: "shape_relations.sequence_id",
        seq2: "way_nodes.sequence_id"
    });

    query = "SELECT " + columns +
            " FROM nodes " +
            "LEFT JOIN way_nodes ON nodes.id = way_nodes.node_id " +
            "LEFT JOIN shape_relations ON (shape_relations.relation_type = 'Way' AND way_nodes.way_id = shape_relations.relation_id) " +
                "OR (shape_relations.relation_type = 'Node' AND nodes.id = shape_relations.relation_id) ";

    boxq  = ["lat <= :north", "lat >= :south", "lon >= :west", "lon <= :east"].join(" AND ") + ' ';
    order = "ORDER BY shape, seq1, seq2 ";
    where = "WHERE shape_relations.shape_id ";

    if (_.isNumber(shapes)) shapes = [shapes];

    if (Array.isArray(shapes))
        where += "IN (:shapes) ";
    else if (typeof changeset === 'number')
        where += "IN (SELECT object_id FROM directives WHERE changeset_id = :changeset AND object = 'shape') ";
    else if (!isNaN(period)) {
        if (getType) where += "IN (SELECT id FROM shapes WHERE :period = ANY (periods) AND type_id IN (:type)) ";
        else         where += "IN (SELECT id FROM shapes WHERE :period = ANY (periods)) ";
    } else if (!isNaN(year)) {
        if (getType) where += "IN (SELECT id FROM shapes WHERE start_year <= :year AND end_year > :year AND type_id IN (:type)) ";
        else         where += "IN (SELECT id FROM shapes WHERE start_year <= :year AND end_year > :year) ";
    } else {
        if (callback) return callback("getNodes needs shapes, changeset, year, or period ID");
        return queue.throw(util.err("getNodes needs shapes, changeset, year, or period ID"));
    }

    if (isNaN(period) && isNaN(year) && getType) where += "shape_relations.shape_id IN (SELECT id FROM shapes WHERE type_id IN (:type)) ";

    if (Array.isArray(box)) where += ' AND ' + boxq;
    else box = [];

    query += where + order;

    return queue.add(query, {
        shapes: shapes ? [[shapes.join()]] : '',
        period: period,
        year: year,
        changeset: changeset,
        type: type,
        west: box[0], south: box[1],
        east: box[2], north: box[3]
    }).nodeify(callback);
};

// Format shape data
var cleanShapeData = Shape.cleanShapeData = function(data) {
    // Create new data object w/ fixed columns
    var newData = {
        type_id:      data.type_id,
        periods:      data.periods,
        start_day:    data.start_day || 1,
        start_month:  data.start_month || 1,
        start_year:   data.start_year,
        end_day:      data.end_day || 1,
        end_month:    data.end_month || 1,
        end_year:     data.end_year,
        tags:         data.tags || [],
        data: null,
    };

    // Create hstore with extra data
    var hstore = _(data).reduce(function(hstore, value, key) {
        if (!_.contains(_.keys(newData), key)) {
            value = pg.engine.escape(value).replace(/'/g, "\"");
            hstore.push(key + ' => ' + value);
        }
        return hstore;
    }, []);
    newData.data = [["'" + hstore.join(", ") + "'"]];

    return newData;
};

Shape.create = function(data, callback) {
    data = cleanShapeData(data);

    return this.returning("id").insert(data).nodeify(callback);
};

// Connects a shape with current nodes/ways/shapes
// (nodes must be created first)
Shape.connect = function(shapeId, relations, callback) {
    var rels = [],
        i = 0;

    if (relations.length === 0)
        return Q.reject(util.err('no nodes, ways, or shapes','connecting shape'));

    relations.forEach(function(rel) {
        rels.push({
            shape_id: shapeId,
            relation_type: rel.type,
            relation_id: rel.id,
            relation_role: rel.role || ' ',
            sequence_id: rel.sequence || i++
        });
    });

    return Shape.Relation.insert(rels).then(function(res) {
        return shapeId;
    }).nodeify(callback);
};

Shape.finish = function(data, relations, callback) {
    return Shape.create(data).then(function(shapes) {
        var id = parseFloat(shapes[0].id);
        return Shape.connect(id, relations);
    }).nodeify(callback);
};

