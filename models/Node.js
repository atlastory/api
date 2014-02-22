var db = require('../db/db'),
    util = require('../lib/utilities');


var Node = module.exports = db.pg.model("nodes", {
    map: true,
    schema: {
        latitude: { type: Number, allowNull: false },
        longitude: { type: Number, allowNull: false },
        changeset_id: Number,
        tile: Number
    },
    getters: {}
});


// Creates nodes in DB, adds ids to nodes array
Node._create = Node.create;
Node.create = function(coords, changeset, callback) {
    var q = "INSERT INTO nodes (longitude, latitude, changeset_id) VALUES ",
        values = [],
        ids = [],
        _this = this;

    if (typeof changeset === 'function') {
        callback = changeset;
        changeset = 'NULL';
    }
    if (typeof coords[1] === 'number') coords = [coords];

    coords.forEach(function(coord) {
        if (!util.verifyCoord(coord)) return callback('bad coord');
        values.push('(' + coord.join() + ',' + changeset + ')');
    });
    values = values.join();
    q += values + ' RETURNING id';

    db.pg.query(q, function(err, rows) {
        if (err) callback('createNodes > '+err);
        else rows.forEach(function(row, i) {
            var id = parseFloat(row.id);
            ids.push(id);
        });
        callback(null, ids);
    });
};
