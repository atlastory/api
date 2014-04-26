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
var WayNode = pg.model("way_nodes", { idAttribute: 'sequence_id' });
var Node = require('./Node');

var ways = [];
var allNodes = Way.nodes = [];

Way.getNodes = function(wayId, callback) {
    var q = "SELECT nodes.* FROM nodes JOIN way_nodes ON nodes.id = way_nodes.node_id " +
            "WHERE way_nodes.way_id = :wayId ORDER BY way_nodes.sequence_id";

    pg.query(q, { wayId: wayId }, function(err, nodes) {
        if (err) callback('Error getting WayNodes: '+err);
        else callback(null, nodes);
    });
};

// Creates a way with nodes
Way.create = function(coords, data, callback) {
    var id, wayData;

    if (typeof data === 'function') {
        callback = data;
        data = {};
    }
    wayData  = _.pick(data, _.keys(Way._modelOps.schema));

    Way.insert(_.extend(wayData, { id: [['DEFAULT']] }))
      .returning('id', function(err, rows) {
        if (err) callback('Error creating Way: '+err);
        else {
            id = parseFloat(rows[0].id);
            ways.push(id);
            Way.createNodes(id, coords, data, callback);
        }
    });
};

// Connects a way with nodes (nodes must be created first)
Way.connectNodes = function(wayId, nodes, callback) {
    var wayNodes = [];

    nodes.forEach(function(node, i) {
        wayNodes.push({
            node_id: node,
            way_id: wayId,
            sequence_id: i
        });
    });

    WayNode.insert(wayNodes, function(err) {
        if (err) callback(err);
        else callback(null);
    });
};

// Creates nodes + connecting wayNodes
Way.createNodes = function(wayId, coords, data, callback) {
    var nodes = [],
        relation = { id: wayId };

    if (typeof data === 'function') {
        callback = data;
        data = {};
    }
    nodeData = _.pick(data, _.keys(Node._modelOps.schema));

    // If role is included, add it to returned relation
    if (data.role) relation.role = data.role;

    coords.forEach(function(coord, i) {
        if (!util.verifyCoord(coord)) return callback('bad coord');

        // Check to see if Node already exists
        var duplicate = false, combo = allNodes.concat(nodes);
        for (var n in combo) {
            if (combo[n].toString() == coord.toString()) {
                duplicate = true;
                break;
            }
        }

        if (duplicate) {
            var find = Node.select('id')
                .where({ longitude: coord[0], latitude: coord[1] })
                .order('created_at DESC').limit(1);
            pg.queue(WayNode.insert({
                node_id: [['('+find+')']],
                way_id: wayId,
                sequence_id: i
            }));
        } else {
            pg.queue(Node.insert(_.extend(nodeData, {
                longitude: coord[0],
                latitude: coord[1]
            })));
            pg.queue(WayNode.insert({
                node_id: [['LASTVAL()']],
                way_id: wayId,
                sequence_id: i
            }));
            nodes.push(coord); // add to master node array
        }
    });

    pg.run(function(err) {
        if (err) callback('Error creating WayNodes: '+err);
        else {
            allNodes = allNodes.concat(nodes); // add local nodes to global nodes
            callback(null, relation);
        }
    });
};

// Update way_nodes (add/remove node in sequence)

/*
problem with updating sequence -- duplicate way_nodes unique id
UPDATE way_nodes SET sequence_id = sequence_id + 1 WHERE way_id = 4 AND sequence_id >= 4;
INSERT INTO nodes (latitude, longitude) VALUES (16,16) RETURNING id;
INSERT INTO way_nodes (way_id,node_id,sequence_id) VALUES (4,LASTVAL(),4);

*/
Way.addNode = function() {};
