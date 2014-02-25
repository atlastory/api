var db = require('../db/db'),
    util = require('../lib/utilities'),
    async = require('async'),
    hstore = require('hstore.js');


var Shape = module.exports = db.pg.model("shapes", {
    map: true,
    schema: {
        period_id: { type: Number, allowNull: false },
        changeset_id: Number,
        name: String,
        description: String,
        day_start: String,
        day_end: String,
        sources: [Number],
        tags: [Number],
        data: { type: 'hstore' }
    },
    getters: {
        data: function() {
            return hstore.parse(this.data, { numeric_check: true });
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
        ShapeRelation.where({ shape_id: id }).order('sequence_id', cb);
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

