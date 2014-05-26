var _ = require('lodash'),
    crypto = require('crypto'),
    topojson = require('topojson'),
    db = require('../db/db');

/* Error handling in the form of:
 * util.err('error message string')
 * util.err(util.err('passed error'))
 * util.err({error properties object})
     code     INT
     action   STRING
     message  STRING
     details  STRING
 */

Error.prototype = _.extend(Error.prototype, {
    toJSON: function() {
        var obj = {},
            props = Object.getOwnPropertyNames(this);
        props.forEach(function(key) {
            obj[key] = this[key];
        }, this);

        obj.stack = obj.stack.split('\n    ');
        obj.stack.splice(1, 1); // remove err shortcut
        obj.stack.splice(-4, 4); // remove generic node levels

        return obj;
    },
    toString: function() {
        var head = 'Error',
            body = '',
            details = '';
        if (this.code) head += ' ' + this.code;
        if (this.action) head += ' ' + this.action;
        if (this.message || this.details) head += ': ';
        if (this.message) body += this.message;
        if (this.details) details = ' ('+this.details+')';

        return head + body + details;
    }
});

exports.err = function(msg) {
    var error;

    if (!msg || typeof msg === 'string') error = new Error(msg);
    else if (msg instanceof Error) error = msg;
    else if (_.isPlainObject(msg)) {
        error = new Error(msg.message);
        error = _.assign(error, msg);
    }

    return error;
};

// Replaces values in a string
exports.replace = function(string, values) {
    values.forEach(function(v,i){
        i++;
        string = string.replace(new RegExp("%"+i,"g"),v);
    });
    return string;
};

// Creates crypto hash
exports.createHash = function(number) {
    var now = (new Date()).toString() + '-' + number;
    return crypto.createHash('md4')
        .update(now).digest("hex");
};

// Verify a coordinate's legit-ness
exports.verifyCoord = function(coord) {
    if (!Array.isArray(coord)) return false;
    if (typeof coord[0] !== "number") return false;
    if (typeof coord[1] !== "number") return false;
    if (coord[0] < -180 || coord[0] > 180) return false;
    if (coord[1] < -85.05112878 || coord[1] > 85) return false;
    return true;
};

// Format shape data
exports.cleanData = function(data) {
    // Create new data object w/ fixed columns
    var newData = {
        type_id:      data.type_id,
        periods:      data.periods,
        name:         data.name || '',
        description:  data.description || '',
        date_start:   data.date_start || '',
        date_end:     data.date_end || '',
        tags:         data.tags || [],
        data: null,
    },  hstore = [],
        keys = _.keys(newData);

    // Create hstore with extra data
    for (var key in data) {
        var value;
        if (!_.contains(keys, key)) {
            value = db.pg.engine.escape(data[key]);
            value = value.replace(/'/g, "\"");
            hstore.push(key + ' => ' + value);
        }
    }
    newData.data = { noEscape: "'"+hstore.join(", ")+"'" };

    return newData;
};

// Creates an SQL columns string from an object
exports.columnString = function(object) {
    var columns = [];
    for (var col in object) {
        columns.push(object[col] + ' AS ' + col);
    }
    return columns.join(', ');
};

// Separates GeoJSON features into buckets that share nodes
exports.getShareBuckets = function(features) {
    var bag = [],
        buckets = [],
        idBuckets = [],
        bucketCount = 1,
        coords, nodes, bucket, feature, node;

    for (var f in features) {
        nodes = [];
        coords = features[f].geometry.coordinates;
        coords = _.flatten(coords);
        for (var i=coords.length-1; i >= 0; i--) nodes.push(coords.splice(i--,2)+'');
        bag.push(nodes);
    }

    for (var i = bag.length-1; i >= 0; i--) {
        // Pulls feature out of bag to compare
        bucket = bag.splice(i,1)[0];
        idBuckets.push([i]);

        for (var f = bag.length-1; f >= 0; f--) {
            var common = _.intersection(bucket, bag[f]);
            if (!_.isEmpty(common)) {
                bucket = bucket.concat(bag[f]); // add nodes to bucket
                bag[f] = null; // remove feature from bag
                idBuckets[idBuckets.length-1].push(f); // add ID to bucket IDs
                f = bag.length; // start loop over
                i--;
            } else {
            }
        }
        bag = _.compact(bag); // clear out removed features
    }

    for (var b in idBuckets) {
        bucket = [];
        for (id in idBuckets[b]) {
            bucket.push(features[idBuckets[b][id]].properties.name);
        }
        buckets.push(bucket);
    }

    return buckets;
};

// Convert GeoJSON to TopoJSON
exports.convertTopoJSON = function(geojson) {
    return topojson.topology({
        collection: geojson
    }, {
        "id": function(d){ return d.id || d.gid; },
        "quantization": 1e4,
        "property-transform": function(p,k,v) {
            p[k] = v;
            return true;
        }
    });
};

// Formats 2-d key/value array to JSON
exports.arrayToJson = function(array) {
    var json = {};
    array.forEach(function(a) {
        json[a[0]] = a[1];
    });
    return json;
};

// Converts 'data' column in array of rows into JSON
exports.convertData = function(rows) {
    rows.forEach(function(row) {
        if (row.hasOwnProperty('data')) row.data = exports.arrayToJson(row.data);
    });
    return rows;
};


// OLD UTILITIES =========================================
//========================================================

// Utility for building a GeoJSON object
exports.buildGeoJSON = function(shapes, extras) {
    extras = extras || {};
    if (!Array.isArray(shapes)) shapes = [shapes];
    var geoJSON = {
        "type": "FeatureCollection",
        "features": []
    };

    shapes.forEach(function(shape) {
        var geom = JSON.parse(shape.geom);
            delete shape.geom;
            delete shape.shape;
        var feature = {
            "type": "Feature",
            "properties": _.extend(shape, extras),
            "geometry": geom
        };
        geoJSON.features.push(feature);
    });

    return geoJSON;
};
