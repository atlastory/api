var _ = require('lodash'),
    pg = require('../db/db').pg,
    util = require('../lib/utilities');


var Node = module.exports = pg.model("nodes", {
    map: true,
    schema: {
        latitude: { type: Number, allowNull: false },
        longitude: { type: Number, allowNull: false },
        tile: Number,
        created_at: Date
    },
    getters: {}
});


// Creates nodes in DB, adds ids to nodes array
Node._create = Node.create;
Node.create = function(coords, data, callback) {
    var nodes = [];

    if (typeof coords[1] === 'number') coords = [coords];
    if (typeof data === 'function') {
        callback = data;
        data = {};
    }
    data = _.pick(data, _.keys(Node._modelOps.schema));

    coords.forEach(function(coord) {
        if (!util.verifyCoord(coord)) return callback('Error creating Node: bad coord');
        nodes.push(_.extend(data, {
            longitude: coord[0],
            latitude: coord[1]
        }));
    });

    Node.insert(nodes, function(err, rows) {
        if (err) return callback('createNodes > '+err);
        nodes = [];
        rows.forEach(function(row, i) {
            nodes.push({ id: parseFloat(row.id) });
        });
        callback(null, nodes);
    });
};
