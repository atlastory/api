var db = require('../db/db'),
    util = require('../lib/utilities');


var Shape = module.exports = db.pg.model("shapes", {
    map: true,
    schema: {
        period_id: { type: Number, allowNull: false },
        changeset_id: Number,
        name: String,
        description: String,
        datestart: String,
        dateend: String,
        sources: [Number],
        tags: [Number],
        data: { type: 'hstore' }
    },
    getters: {}
});

Shape.create = function(data, callback) {
    var id;

    data = util.cleanData(data);

    this.returning("id").insert(data, function(err, rows) {
        if (err) callback('Shape.create > '+err);
        else {
            id = parseFloat(rows[0].id);
            callback(null, id);
        }
    });
};

// Connects a shape with current nodes/ways/shapes
// (nodes must be created first)
Shape.connect = function(shapeId, shapes, callback) {
    var q = "INSERT INTO shape_relations (shape_id, relation_type, relation_id, relation_role, sequence_id) VALUES ",
        values = [],
        i = 0;

    if (!shapes.nodes[0] && !shapes.ways[0] && !shapes.shapes[0]) callback('no nodes/ways/shapes!');

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

