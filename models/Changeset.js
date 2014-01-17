var postgis = require('../lib/postgis'),
    db = require('../db/db'),
    util = require('../lib/utilities');


var Changeset = module.exports = db.pg.model("changesets", {
    map: true,
    schema: {
        changeset: { type: String, allowNull: false },
        user_id:    Number,
        action: { type: String, allowNull: false },
        object:     String,
        map: { type: Number, default: 1 },
        layer:      Number,
        period:     Number,
        shape:      Number,
        data:       String,
        data_old:   String,
        type:       String,
        geom_diff:  String,
        created_at: Date
    },
    // Remove '\' on strings to allow JSON.parse
    getters: {
        data: function() {
            if (this.data) return this.data.replace(/\\/g,'');
        },
        data_old: function() {
            if (this.data_old) return this.data_old.replace(/\\/g,'');
        },
        type: function() {
            if (this.type) return this.type.replace(/\\/g,'');
        }
    },
    methods: {
        toString: function() {
            return [
                this.action,
                this.object,
                'm' + (this.map || 'X'),
                'l' + (this.layer || 'X'),
                'p' + (this.period || 'X'),
                's' + (this.shape || 'X')
            ].join(' ');
        }
    }
});

Changeset.get = function(id, callback) {
    return this.where({ changeset: id }, callback);
};

Changeset.create = function(directives, id, callback) {
    var now = new Date(),
        hash = id;

    // If no id, create one
    if (typeof id === 'function') callback = id;
    if (!id || typeof id === 'function') hash = util.createHash();
    if (!Array.isArray(directives)) directives = [directives];

    directives.forEach(function(d) {
        if (d.toJSON) d = d.toJSON();
        d.changeset = hash;
        d.created_at = now;
        db.pg.queue(Changeset.insert(d));
    });

    // Callback returns hash ID of Changeset
    if (directives.length) db.pg.run(function(err, res) {
        if (err || !Array.isArray(res)) callback(err);
        else callback(null, hash);
    });
    else callback(null, hash);
};

// Gets all directives for a layer
// Changeset.getLayer

// Gets all directives for a shape
// Changeset.getShape

// TODO: Checks directive if it's the most recent change
Changeset.addMethod('checkConflict', function(callback) {
    this.inConflict = false;
    callback(null, this);
});
