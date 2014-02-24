var db = require('../db/db'),
    util = require('../lib/utilities'),
    async = require('async');


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
            if (Array.isArray(this.data))
                return util.arrayToJson(this.data);
            else return this.data;
        }
    }
});
var ShapeRelation = db.pg.model("shape_relations");

Shape._find = Shape.find;
Shape.find = function(ids, callback) {
    return Shape.select([
        'period_id', 'changeset_id',
        'name', 'description',
        'day_start', 'day_end', 'sources', 'tags',
        '%# data AS data' // Format hstore as key/value arrays
    ].join())._find(ids, callback);
};

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
    var q = "INSERT INTO shape_relations (shape_id, relation_type, relation_id, relation_role, sequence_id) VALUES ",
        values = [],
        i = 0;

    if (!shapes.nodes[0] && !shapes.ways[0] && !shapes.shapes[0]) callback('no nodes/ways/shapes!');

// TODO: implement relation 'roles': outer, inner, center (node)
    shapes.nodes.forEach(function(node) {
        values.push('(' + [shapeId, "'Node'", node, "''", i++].join() + ')');
    });
    shapes.ways.forEach(function(way) {
        values.push('(' + [shapeId, "'Way'", way, "''", i++].join() + ')');
    });
    shapes.shapes.forEach(function(shape) {
        values.push('(' + [shapeId, "'Shape'", shape, "''", i++].join() + ')');
    });
    q += values.join();

    db.pg.query(q, function(err) {
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

