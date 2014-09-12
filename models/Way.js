var _ = require('lodash'),
    pg = require('../services/db').pg,
    util = require('../lib/utilities');


var Way = module.exports = pg.model("ways", {
    schema: { created_at: Date }
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

/**
 * Creates a new way with nodes
 * @param {array}  coords An array of coordinates [lon, lat]
 * @param {object} data   Any data that should be passed on to nodes
 * @callback callback
 * @returns {array} Array of WayNodes (way, node, sequence)
 */
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

    return Way.insert(_.extend(wayData, { id: [['DEFAULT']] })).returning('id')
    .then(function(ways) {
        return Way.addNodes(parseFloat(ways[0].id), 0, coords);
    }).nodeify(callback);
};

/**
 * Adds new or existing nodes into way (must be sequential)
 * @param {number} wayId    ID of Way to add to
 * @param {number} position Postion of nodes in sequence
 * @param {(num[]|object[])} nodes  Array of node IDs or objects (new nodes) to add
 * @returns {array} Array of WayNodes (way, node, sequence)
 */
Way.addQueryMethod('addNodes', function(wayId, position, nodes) {
    position = parseFloat(position || 0);
    if (isNaN(position)) return util.err('Position is not a number','adding nodes');
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
        };
    });

    return pg.queue()
        .add(Way.Node.update({
            sequence_id: [['sequence_id + ' + nodes.length]]
        }).where('way_id = :way AND sequence_id >= :seq', {
            way: wayId,
            seq: position
        }))
        .add(Way.Node.insert(nodes).returning('*'));
}, function(wayNode) {
    return {
        way_id: wayNode.way_id,
        node_id: wayNode.node_id,
        sequence_id: parseFloat(wayNode.sequence_id)
    };
});

/**
 * Removes nodes from way (must be sequential)
 * @param {number} wayId
 * @param {number[]} nodeIds Array of node IDs to remove
 */
Way.addQueryMethod('removeNodes', function(wayId, nodeIds) {
    if (!_.isArray(nodeIds)) nodeIds = [nodeIds];

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
        "way_nodes.node_id = new_table.node_id",
        { way: wayId, seq: sequence })
      .add('DROP SEQUENCE ' + sequence);

    return queue;
});

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
