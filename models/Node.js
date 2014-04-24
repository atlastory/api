var db = require('../db/db'),
    util = require('../lib/utilities');


var Node = module.exports = db.pg.model("nodes", {
    map: true,
    schema: {
        latitude: { type: Number, allowNull: false },
        longitude: { type: Number, allowNull: false },
        changeset: String,
        tile: Number
    },
    getters: {}
});


// Creates nodes in DB, adds ids to nodes array
Node._create = Node.create;
Node.create = function(coords, changeset, callback) {
    var ids = [],
        nodes = [];

    if (typeof changeset === 'function') {
        callback = changeset;
        changeset = null;
    }
    if (typeof coords[1] === 'number') coords = [coords];

    coords.forEach(function(coord) {
        if (!util.verifyCoord(coord)) return callback('bad coord');
        nodes.push({
            longitude: coord[0],
            latitude: coord[1],
            changeset: changeset
        });
    });

    Node.insert(nodes, function(err, rows) {
        if (err) callback('createNodes > '+err);
        else rows.forEach(function(row, i) {
            var id = parseFloat(row.id);
            ids.push(id);
        });
        callback(null, ids);
    });
};
