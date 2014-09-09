var _ = require('lodash'),
    pg = require('../services/db').pg,
    util = require('../lib/utilities');


var Directive = module.exports = pg.model("directives", {
    schema: {
        changeset_id: { type: Number, allowNull: false },
        action: { type: String, allowNull: false },
        object:          String,
        object_id:       String,
        data:            String, // Stringified JSON object for shapes, types, sources
        geometry:        String, // Stringified coordinate array
        way_nodes:       String, // if object=way: List nodeId > '345,678'
                                 // if object=node: List wayId-sequence > '0-1234,1-2345'
        shape_relations: String, // if object=shape: List sequence-Type-role-id > '3-Way-outer-1234,4-Way-inner-2345'
                                 // if object=node,way: List shapeId-sequence > '0-1234,1-2345'
        created_at:      Date
    },
    getters: {
        data: parseJSON('data', {}),
        geometry: parseJSON('geometry', []),
        way_nodes: function() {
            if (!_.isString(this.way_nodes)) return null;
            return this.way_nodes.split(',');
        },
        shape_relations: function() {
            if (!_.isString(this.shape_relations)) return null;
            return this.shape_relations.split(',');
        }
    },
    methods: {
        asString: function() {
            var data = _.map(this.data, function(val, key) {
                return key + ' = ' + pg.engine.escape(val);
            });

            return [
                this.action,
                this.object,
                this.object_id,
                data.length ? 'data('+data.join(', ')+')' : null,
                this.geometry.length ? 'geometry' + JSON.stringify(this.geometry) : null,
                this.way_nodes ? 'with wayNodes(' + this.way_nodes.join(', ') + ')' : null,
                this.shape_relations ? 'with shapeRelations('+this.shape_relations.join(', ')+')' : null,
            ].join(' ').replace(/\s+/g,' ').replace(/\s+$/,'');
        }
    }
});

function parseJSON(col, empty) {
    return function() {
        if (_.isString(this[col])) {
            try {
                return JSON.parse(this[col].replace(/\\/g,''));
            } catch(err) {
                return empty;
            }
        }
        else if (_.isObject(this[col])) return this[col];
        return empty;
    };
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
    return Directive.insert(directives, function(err, res) {
        if (err || !Array.isArray(res)) callback(err);
        else callback(null, id, res.map(function(r) {
            return parseFloat(r.id);
        }));
    });
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
