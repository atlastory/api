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
    /* Adds new or existing nodes into way (must be sequential)
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

// Removes nodes from way (must be sequential)
Way.addQueryMethod('removeNodes', function(wayId, nodeIds) {
    if (!_.isArray(nodeIds)) nodeIds = [nodeIds];
    nodeIds = nodeIds.map(function(n) { return parseFloat(n); });

    var sequence = _.uniqueId('way_seq_'),
        queue = pg.queue()
        .add(Way.Node.where({ way_id: wayId, node_id: nodeIds }).remove());

    // Re-numbers sequence without losing order
    queue.add('CREATE SEQUENCE ' + sequence)
      .add("UPDATE way_nodes SET sequence_id = newseq FROM (" +
        "SELECT node_id, (nextval(:seq) - 1) AS newseq FROM " +
            "(SELECT node_id FROM way_nodes WHERE way_id = :way ORDER BY sequence_id) AS sub" +
        ") AS new_table WHERE " +
        "way_nodes.way_id = :way AND " +
        "way_nodes.node_id = new_table.node_id"
    , { way: wayId, seq: sequence })
      .add('DROP SEQUENCE ' + sequence);

    return queue;
});
