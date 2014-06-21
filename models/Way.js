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
Way.addChain('getNodes', function(wayId) {
    var q = "SELECT nodes.* FROM nodes JOIN way_nodes ON nodes.id = way_nodes.node_id " +
            "WHERE way_nodes.way_id = :wayId ORDER BY way_nodes.sequence_id";

    return this._replace(q, { wayId: wayId });
});

// Creates a way with nodes
Way.create = function(coords, data, callback) {
    var id, wayData;

    if (typeof data === 'function') {
        callback = data;
        data = {};
    }
    wayData  = _.pick(data, _.keys(Way._schema));

    Way.insert(_.extend(wayData, { id: [['DEFAULT']] }))
      .returning('id', function(err, rows) {
        if (err) callback('Error creating Way: '+err);
        else {
            id = parseFloat(rows[0].id);
            Way.createNodes(id, coords, data, callback);
        }
    });
};

// Connects a way with nodes (nodes must be created first)
Way.addChain('connectNodes', function(wayId, nodes) {
    return Way.Node.insert(nodes.map(function(node, i) {
        return {
            node_id: node,
            way_id: wayId,
            sequence_id: i
        };
    }));
};

// Creates nodes + connecting wayNodes
Way.addChain('createNodes', function(wayId, coords, data) {
    var esc = pg.engine.escape,
        relation = { id: wayId },
        nodes = [];

    if (typeof data === 'function') {
        callback = data;
        data = {};
    }
    // If role is included, add it to returned relation
    if (data.role) relation.role = data.role;

    data = _.pick(data, _.keys(Node._schema));

    for (var i=0; i < coords.length; i++) {
        var coord = coords[i];
        if (!util.verifyCoord(coord)) return callback('bad coord');

        var nodeData = [
            esc(coord[0]), esc(coord[1]),
            esc(data.source_id), esc(data.tile)
        ].join(',');

        nodes.push({
            node_id: [['create_node('+nodeData+')']],
            way_id: wayId,
            sequence_id: i
        });
    };

    return Way.Node.insert(nodes);
});


Way.addChain('addNodes', function(wayId, position, nodes) {
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
            n = [esc(n.longitude), esc(n.latitude), esc(n.source_id), esc(n.tile)];
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
        .add(Way.Node.insert(nodes));

    return queue;
}, function(seq) { return parseFloat(seq.sequence_id); });

Way.removeNode = function() {};
