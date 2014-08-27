var _ = require('lodash'),
    pg = require('../services/db').pg,
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
    if (typeof coords[1] === 'number') coords = [coords];
    if (typeof data === 'function') {
        callback = data;
        data = {};
    }
    data = _.pick(data, _.keys(Node._schema));

    var nodes = coords.map(function(coord) {
        if (!util.verifyCoord(coord)) return null;
        return _.extend(_.clone(data), {
            longitude: coord[0],
            latitude: coord[1]
        });
    });

    return Node.insert(_.compact(nodes)).then(function(nodes) {
        return nodes.map(function(n) {
            return { id: parseFloat(n.id) };
        });
    }).nodeify(callback);
};
