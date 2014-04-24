var db = require('../db/db'),
    util = require('../lib/utilities');


var Changeset = module.exports = db.pg.model("changesets", {
    map: true,
    schema: {
        changeset: { type: String, allowNull: false },
        user_id:    Number,
        action: { type: String, allowNull: false },
        object:     String,
        object_id:  Number,
        data:       String,
        geometry:   String,
        created_at: Date
    },
    // Remove '\' on strings to allow JSON.parse
    getters: {
        data: function() {
            if (this.data) return this.data.replace(/\\/g,'');
        }
    },
    methods: {
        toString: function() {
            var keys = [],
                data = JSON.parse(this.data);
            for (var key in data) {
                keys.push(key + ' = ' + db.pg.engine.escape(data[key]));
            }

            return [
                this.action,
                this.object,
                this.object_id,
                (keys.length) ? '('+keys.join(', ')+')' : null
            ].join(' ').replace(/\s+/g, ' ');
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
    if (!Array.isArray(directives)) directives = [directives];
    if (!id || typeof id === 'function') hash = util.createHash(directives[0].user_id);

    directives.forEach(function(d) {
        if (d.toJSON) d = d.toJSON();
        d.changeset = hash;
        d.created_at = now;
        db.pg.queue(Changeset.insert(d).returning('id'));
    });

    // Callback returns hash ID of Changeset
    if (directives.length) db.pg.run(function(err, res) {
        if (err || !Array.isArray(res)) callback(err);
        else callback(null, hash, parseFloat(res[0].id));
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
