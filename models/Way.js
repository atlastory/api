var db = require('../db/db'),
    util = require('../lib/utilities');


var Way = module.exports = db.pg.model("ways", {
    map: true,
    schema: {
        changeset: String
    },
    getters: {}
});
var WayNode = db.pg.model("way_nodes", { idAttribute: 'sequence_id' });
var Node = db.pg.model("nodes");

var ways = [],
    allNodes = Way.nodes = [];

Way.getNodes = function(wayId, callback) {
    var q = "SELECT nodes.* FROM nodes JOIN way_nodes ON nodes.id = way_nodes.node_id " +
            "WHERE way_nodes.way_id = :wayId ORDER BY way_nodes.sequence_id";

    db.pg.query(q, { wayId: wayId }, function(err, nodes) {
        if (err) callback('findNodes > '+err);
        else callback(null, nodes);
    });
};

// Creates a way with nodes
Way.create = function(options, callback) {
    /* Creates a way with associated nodes
     *
     * coordinates  ARRAY
     * changeset    INTEGER (optional)
     */

    var id,
        coords = Array.isArray(options) ? options : options.coordinates,
        changeset = options.changeset || null;

    Way.insert({ changeset: changeset }).returning('id', function(err, rows) {
        if (err) callback('insertWay > '+err);
        else {
            id = parseFloat(rows[0].id);
            ways.push(id);
            Way.createNodes(id, coords, changeset, callback);
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
Way.createNodes = function(wayId, coords, changeset, callback) {
    var nodes = [], find;

    if (typeof changeset === 'function') {
        callback = changeset;
        changeset = null;
    }

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
            find = Node.select('id').where({ longitude: coord[0], latitude: coord[1] }).order('created_at DESC').limit(1);
            db.pg.queue(WayNode.insert({
                node_id: [['('+find+')']],
                way_id: wayId,
                sequence_id: i
            }));
        } else {
            db.pg.queue(Node.insert({ longitude: coord[0], latitude: coord[1], changeset: changeset }));
            db.pg.queue(WayNode.insert({
                node_id: [['LASTVAL()']],
                way_id: wayId,
                sequence_id: i
            }));
            nodes.push(coord); // add to master node array
        }
    });

    db.pg.run(function(err) {
        if (err) callback(err);
        else {
            allNodes = allNodes.concat(nodes); // add local nodes to global nodes
            callback(null, wayId);
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
