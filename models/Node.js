var _ = require('lodash'),
    Q = require('q'),
    pg = require('../services/db').pg,
    util = require('../lib/utilities');


var Node = module.exports = pg.model("nodes", {
    schema: {
        latitude: { type: Number, allowNull: false },
        longitude: { type: Number, allowNull: false },
        source_id: Number,
        tile: Number,
        created_at: Date
    },
    getters: {}
});


// Creates nodes in DB
Node._create = Node.create;
Node.create = function(coords, data) {
    if (typeof coords[1] === 'number') coords = [coords];
    data = data || {};
    data = _.pick(data, _.keys(Node._schema));

    var nodes = _.compact(coords.map(function(coord) {
        if (!util.verifyCoord(coord)) return null;
        return _.extend(_.clone(data), {
            longitude: coord[0],
            latitude: coord[1]
        });
    }));

    if (!nodes.length) return Q([]);
    return Node.insert(nodes).then(function(nodes) {
        return nodes.map(function(n) {
            return { id: n.id };
        });
    });
};
