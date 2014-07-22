var pg = require('../db/db').pg,
    util = require('../lib/utilities');


var Directive = module.exports = pg.model("directives", {
    map: true,
    schema: {
        changeset_id: { type: Number, allowNull: false },
        action: { type: String, allowNull: false },
        object:          String,
        object_id:       Number,
        data:            String,
        geometry:        String,
        way_nodes:       String,
        shape_relations: String,
        created_at:      Date
    },
    getters: {
        data: parseJSON('data', {}),
        geometry: parseJSON('geometry', []),
        way_nodes: parseJSON('way_nodes', []),
        shape_relations: parseJSON('shape_relations', [])
    },
    methods: {
        toString: function() {
            var keys = [], data;

            try {
                data = JSON.parse(this.data);
            } catch(err) {
                data = {};
            }

            for (var key in data) {
                keys.push(key + ' = ' + pg.engine.escape(data[key]));
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

function parseJSON(col, empty) {
    return function() {
        if (this[col]) {
            return JSON.parse(this[col].replace(/\\/g,''));
        } else return empty;
    }
}

Directive.changeset = function(id, callback) {
    return this.where({ changeset_id: id }, callback);
};

Directive.create = function(id, directives, callback) {
    var now = new Date();

    if (!Array.isArray(directives)) directives = [directives];

    function stringify(d, col) {
        if (typeof d[col] === 'object') d[col] = JSON.stringify(d[col]);
        return d;
    }

    directives = directives.map(function(d) {
        if (d.toJSON) d = d.toJSON();
        d.action = d.action.toLowerCase();
        d.object = d.object.toLowerCase();
        d.changeset_id = id;
        d.created_at = now;
        d = stringify(d, 'data');
        d = stringify(d, 'geometry');
        d = stringify(d, 'way_nodes');
        d = stringify(d, 'shape_relations');
        return d;
    });

    if (!callback) return Directive.insert(directives);
    if (directives.length) Directive.insert(directives, function(err, res) {
        if (err || !Array.isArray(res)) callback(err);
        else callback(null, id, res.map(function(r) {
            return parseFloat(r.id);
        }));
    });
    else callback(null, id, []);
};

// Gets all directives for a type
// Directive.getType

// Gets all directives for a shape
// Directive.getShape

// TODO: Checks directive if it's the most recent change
Directive.addMethod('checkConflict', function(callback) {
    this.inConflict = false;
    callback(null, this);
});
