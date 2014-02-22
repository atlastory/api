var db = require('../db/db'),
    util = require('../lib/utilities');


var Way = module.exports = db.pg.model("ways", {
    map: true,
    schema: {
        changeset_id: Number
    },
    getters: {}
});

var ways = [],
    allNodes = Way.nodes = [];

// Creates a way with nodes
Way.create = function(options, callback) {
    /* Creates a way with associated nodes
     *
     * coordinates  ARRAY
     * changeset    INTEGER (optional)
     */

    var id,
        coords = options.coordinates,
        changeset = options.changeset_id || null;

    Way.insert({ changeset_id: changeset }).returning('id', function(err, rows) {
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
    var q = "INSERT INTO way_nodes (node_id, way_id, sequence_id) VALUES ",
        values = [],
        _this = this;

    nodes.forEach(function(node, i) {
        values.push('(' + [node, wayId, i].join() + ')');
    });
    q += values.join();

    db.pg.query(q, function(err) {
        if (err) callback(err);
        else callback(null);
    });
};

// Creates nodes + connecting wayNodes
Way.createNodes = function(wayId, coords, changeset, callback) {
    var queries = [],
        qNode = "INSERT INTO nodes (longitude, latitude, changeset_id) VALUES ",
        qWN = "INSERT INTO way_nodes (node_id, way_id, sequence_id) VALUES ",
        qFind = "(SELECT id FROM nodes WHERE longitude = ",
        nodes = [], q, find;

    if (typeof changeset === 'function') {
        callback = changeset;
        changeset = 'NULL';
    }
    if (changeset === null) changeset = 'NULL';

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
            find = qFind + coord[0] + " AND latitude = " + coord[1] + ' ORDER BY created_at DESC LIMIT 1)';
            queries.push(qWN + '(' + [find, wayId, i].join() + ')');
        } else {
            queries.push(qNode + '(' + [coord[0], coord[1], changeset].join() + ') RETURNING id');
            queries.push(qWN + '(LASTVAL(),' + [wayId, i].join() + ')');
            nodes.push(coord); // add to master node array
        }
    });
    queries = queries.join('; ');

    db.pg.query(queries, function(err) {
        if (err) callback(err);
        else {
            allNodes = allNodes.concat(nodes); // add local nodes to global nodes
            callback(null, wayId);
        }
    });
};
