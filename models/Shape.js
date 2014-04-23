var db = require('../db/db'),
    util = require('../lib/utilities'),
    async = require('async'),
    hstore = require('hstore.js');


var Shape = module.exports = db.pg.model("shapes", {
    map: true,
    schema: {
        changeset_id: Number,
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


// Gets a single shape with associated nodes/ways
Shape.get = function(id, callback) {
    var shape = {};
    if (typeof id !== 'number') return callback('Shape id must be a number');

    async.parallel({ properties: function(cb) {
        Shape.find(id, cb);
    }, features: function(cb) {
        Shape.getRelations(id, cb);
    }}, function(err, res) {
        if (err) return callback('Shape#get > '+err);
        shape.properties = res.properties[0];
        shape.features = res.features.map(function(feature) {
            return {
                type: feature.relation_type,
                id: feature.relation_id,
                role: feature.relation_role
            };
        });
        callback(null, shape);
    });
};

Shape.getRelations = function(id, callback) {
    if (Array.isArray(id)) id = id.join(",");
    ShapeRelation.where('shape_id IN ('+id+')').order('sequence_id', callback);
};

Shape.getNodes = function(options, callback) {
    /* Gets all Nodes for a set of shapes
     *
     * shapes    INTEGER|ARRAY
     * period    INTEGER
     * changeset INTEGER
     * box       ARRAY   [west, south, east, north]
     */
    var shapes = options.shapes,
        period = options.period,
        changeset = options.changeset,
        box = options.box;

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
    order = "ORDER BY shape_id, seq1, seq2 ";
    where = "WHERE shape_relations.shape_id ";

    if (typeof shapes === 'number')
        where += "= :shape ";
    else if (Array.isArray(shapes))
        where += "IN (:shapes) ";
    else if (typeof changeset === 'number')
        where += "IN (SELECT id FROM shapes WHERE changeset_id = :changeset) ";
    else if (typeof period === 'number')
        where += "IN (SELECT id FROM shapes WHERE :period = ANY (periods)) ";
    else return callback("getNodes needs shapes, changeset, or period ID");

    if (box) where += ' AND ' + boxq;
    else box = [];

    query += where + order;

    db.pg.query(query, {
        shape: shapes,
        shapes: shapes ? shapes.join() : '',
        period: period,
        changeset: changeset,
        west: box[0], south: box[1],
        east: box[2], north: box[3]
    }, function(err, nodes) {
        if (err) return callback("Shape#getNodes > "+err);
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
Shape.connect = function(shapeId, shapes, callback) {
    var relations = [],
        i = 0;

    if (!shapes.nodes[0] && !shapes.ways[0] && !shapes.shapes[0]) callback('no nodes/ways/shapes!');

    // TODO: implement relation 'roles': outer, inner, center (node)
    shapes.nodes.forEach(function(node) {
        relations.push({
            shape_id: shapeId,
            relation_type: 'Node',
            relation_id: node,
            relation_role: ' ',
            sequence_id: i++
        });
    });
    shapes.ways.forEach(function(way) {
        relations.push({
            shape_id: shapeId,
            relation_type: 'Way',
            relation_id: way,
            relation_role: ' ',
            sequence_id: i++
        });
    });
    shapes.shapes.forEach(function(shape) {
        relations.push({
            shape_id: shapeId,
            relation_type: 'Shape',
            relation_id: shape,
            relation_role: ' ',
            sequence_id: i++
        });
    });

    ShapeRelation.insert(relations, function(err) {
        if (err) callback('Shape.connect > '+err);
        else callback(null, shapeId);
    });
};

Shape.finish = function(data, shapes, callback) {
    Shape.create(data, function(err, id) {
        if (err) callback(err);
        else Shape.connect(id, shapes, callback);
    });
};

