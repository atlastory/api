var _ = require('lodash'),
    pg = require('../db/db').pg,
    util = require('../lib/utilities');


var Way = module.exports = pg.model("ways", {
    map: true,
    schema: {
        created_at: Date
    },
    getters: {}
});

Way.Node = pg.model("way_nodes", {
    idAttribute: 'sequence_id'
});
var Node = require('./Node');


// Gets all nodes in a way
Way.addQueryMethod('getNodes', function(wayId) {
    var q = "SELECT nodes.* FROM nodes JOIN way_nodes ON nodes.id = way_nodes.node_id " +
            "WHERE way_nodes.way_id = :wayId ORDER BY way_nodes.sequence_id";

    return this._replace(q, { wayId: wayId });
});

// Creates a new way with nodes
Way.create = function(coords, data, callback) {
    var wayData;

    if (typeof data === 'function') {
        callback = data;
        data = {};
    }

    wayData = _.pick(data, _.keys(Way._schema));
    coords = coords.map(function(coord) {
        return {
            longitude: coord[0],
            latitude: coord[1],
            source_id: data.source_id,
            tile: data.tile
        };
    });

    Way.insert(_.extend(wayData, { id: [['DEFAULT']] }))
      .returning('id', function(err, rows) {
        if (err) return callback('Error creating Way: ' + err);
        Way.addNodes(parseFloat(rows[0].id), 0, coords, callback);
    });
};

// Connects a way with nodes (nodes must be created first)
Way.addQueryMethod('connectNodes', function(wayId, nodes) {
    return Way.Node.insert(nodes.map(function(node, i) {
        return {
            node_id: node,
            way_id: wayId,
            sequence_id: i
        };
    }));
});

Way.addQueryMethod('addNodes', function(wayId, position, nodes) {
    /* Adds new or existing nodes into sequence
     *
     * wayId     INT
     * position  INT  postion of nodes in sequence
     * nodes     INT[] {}[] array of nodes ids or objects to add
     */
    if (!_.isNumber(wayId) || !_.isNumber(position)) return new Error('way#addNodes: Invalid way ID or position');
    if (!_.isArray(nodes)) nodes = [nodes];

    var esc = pg.engine.escape;

    nodes = _.compact(nodes.map(function(n) {
        if (_.isNumber(n)) {
            return n;
        } else if (_.isPlainObject(n) && _.isNumber(n.latitude)) {
            if (!util.verifyCoord([n.longitude, n.latitude])) return null;
            n = [
                esc(n.longitude), esc(n.latitude),
                esc(n.source_id), esc(n.tile)
            ];
            return 'create_node(' + n.join() + ')';
        } else return null;
    })).map(function(n, i) {
        return {
            way_id: wayId,
            node_id: [[n]],
            sequence_id: position + i
        }
    });

    var queue = pg.queue()
        .add(Way.Node.update({
            sequence_id: [['sequence_id + ' + nodes.length]]
        }).where('way_id = :way AND sequence_id >= :seq', {
            way: wayId,
            seq: position
        }))
        .add(Way.Node.insert(nodes).returning('*'));

    return queue;
}, function(wayNode) {
    return {
        way_id: parseFloat(wayNode.way_id),
        node_id: parseFloat(wayNode.node_id),
        sequence_id: parseFloat(wayNode.sequence_id)
    };
});

Way.addQueryMethod('removeNodes', function() {

});
