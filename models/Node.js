var _ = require('lodash'),
    pg = require('../db/db').pg,
    util = require('../lib/utilities');


var Node = module.exports = pg.model("nodes", {
    map: true,
    schema: {
        latitude: { type: Number, allowNull: false },
        longitude: { type: Number, allowNull: false },
        source_id: Number,
        tile: Number,
        created_at: Date
    },
    getters: {}
});


// Creates nodes in DB, adds ids to nodes array
Node._create = Node.create;
Node.create = function(coords, data, callback) {
    var nodes = [], coord;

    if (typeof coords[1] === 'number') coords = [coords];
    if (typeof data === 'function') {
        callback = data;
        data = {};
    }
    data = _.pick(data, _.keys(Node._schema));

    for (var c in coords) {
        coord = coords[c];
        if (!util.verifyCoord(coord)) return callback('Error creating Node: bad coord');
        nodes.push(_.extend(_.clone(data), {
            longitude: coord[0],
            latitude: coord[1]
        }));
    };

    Node.insert(nodes, function(err, rows) {
        if (err) return callback('createNodes > '+err);
        else callback(null, rows.map(function(r) {
            return { id: parseFloat(r.id) };
        }));
    });
};
