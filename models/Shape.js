var _ = require('lodash'),
    db = require('../db/db'),
    util = require('../lib/utilities'),
    async = require('async'),
    hstore = require('hstore.js');


var Shape = module.exports = db.pg.model("shapes", {
    map: true,
    schema: {
        type_id: Number,
        periods: [Number],
        name: String,
        description: String,
        date_start: String,
        date_end: String,
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
var ShapeRelation = db.pg.model("shape_relations", { idAttribute: 'sequence_id' });
var Changeset = require('./Changeset');
var Directive = require('./Directive');


// Gets a single shape with associated nodes/ways
Shape.get = function(id, callback) {
    var shape = {};
    id = parseFloat(id);
    if (isNaN(id)) return callback('Error getting shape: ID must be a number');

    async.parallel({ properties: function(cb) {
        Shape.find(id, cb);
    }, objects: function(cb) {
        Shape.getRelations(id, cb);
    }}, function(err, res) {
        if (err) return callback('Error getting shape: '+err);
        shape.properties = res.properties[0].toJSON();
        shape.objects = res.objects.map(function(rel) {
            return {
                type: rel.relation_type,
                id: rel.relation_id,
                role: rel.relation_role,
                sequence: rel.sequence_id
            };
        });
        callback(null, shape);
    });
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
    ShapeRelation.where('shape_id IN ('+id+')').order('sequence_id', callback);
};

Shape.getData = function(options, callback) {
    /* Gets data for shape(s)
     *
     * shapes    INT|INT[]  ||
     * changeset INT        ||
     * period    INT
     * type      INT        (optional)
     */
     var shapes = options.shapes,
        period = options.period,
        changeset = options.changeset,
        type = options.type;

    var where = [];

    if (_.isNumber(shapes)) shapes = [shapes];
    if (shapes) where.push("id IN (:shapes)");
    if (_.isNumber(period)) where.push(":period = ANY (periods)");
    if (_.isNumber(changeset)) where.push("id IN (SELECT object_id FROM directives WHERE changeset_id = :changeset AND object = 'shape')")
    if (_.isNumber(type)) where.push("type_id = :type");

    where = where.join(' AND ');

    return Shape.where(where, {
        shapes: shapes ? shapes.join() : '',
        period: period,
        changeset: changeset,
        type: type
    }, callback);
};

Shape.getNodes = function(options, callback) {
    /* Gets all Nodes for a set of shapes
     *
     * shapes    INT|INT[]  ||
     * changeset INT        ||
     * period    INT
     * type      INT        (optional)
     * box       ARRAY      [west, south, east, north]
     */
    var shapes = options.shapes,
        period = options.period,
        changeset = options.changeset,
        type = options.type,
        box = options.box,
        getType = (typeof type === 'number');

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

    if (typeof shapes === 'number')
        where += "= :shape ";
    else if (Array.isArray(shapes))
        where += "IN (:shapes) ";
    else if (typeof changeset === 'number')
        where += "IN (SELECT object_id FROM directives WHERE changeset_id = :changeset AND object = 'shape') ";
    else if (typeof period === 'number') {
        if (getType) where += "IN (SELECT id FROM shapes WHERE :period = ANY (periods) AND type = :type) ";
        else         where += "IN (SELECT id FROM shapes WHERE :period = ANY (periods)) ";
    } else return callback("getNodes needs shapes, changeset, or period ID");

    if (typeof period !== 'number' && getType) where += "shape_relations.shape_id IN (SELECT id FROM shapes WHERE type = :type) ";

    if (Array.isArray(box)) where += ' AND ' + boxq;
    else box = [];

    query += where + order;

    db.pg.query(query, {
        shape: shapes,
        shapes: shapes ? shapes.join() : '',
        period: period,
        changeset: changeset,
        type: type,
        west: box[0], south: box[1],
        east: box[2], north: box[3]
    }, function(err, nodes) {
        if (err) return callback("Error getting shape nodes: "+err);
        else callback(null, nodes);
    });
};

Shape.create = function(data, callback) {
    var id;

    data = util.cleanData(data);

    this.returning("id").insert(data, function(err, rows) {
        if (err) return callback('Shape.create > '+err);
        id = parseFloat(rows[0].id);
        callback(null, id);
    });
};

// Connects a shape with current nodes/ways/shapes
// (nodes must be created first)
Shape.connect = function(shapeId, relations, callback) {
    var rels = [],
        i = 0;

    if (relations.length === 0)
        callback('Error connecting shape: no nodes, ways, or shapes');

    relations.forEach(function(rel) {
        rels.push({
            shape_id: shapeId,
            relation_type: rel.type,
            relation_id: rel.id,
            relation_role: rel.role || ' ',
            sequence_id: rel.sequence || i++
        });
    });

    ShapeRelation.insert(rels, function(err) {
        if (err) callback('Error connecting shape: '+err);
        else callback(null, shapeId);
    });
};

Shape.finish = function(data, relations, callback) {
    Shape.create(data, function(err, id) {
        if (err) callback(err);
        else Shape.connect(id, relations, callback);
    });
};

