var _ = require('lodash'),
    crypto = require('crypto'),
    topojson = require('topojson'),
    db = require('../db/db');

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

exports.box = function(x1, y1, x2, y2) {
    return "ST_MakeEnvelope(" +
         x1 + "," +
         y1 + "," +
         x2 + "," +
         y2 + ",4326)";
};

exports.asGeoJSON = function(geom) {
    return "ST_AsGeoJSON(" + geom + ")";
};

exports.fromWKT = function(wkt) {
    return "ST_GeomFromText('" + wkt + "',4326)";
};

exports.fromGeoJSON = function(geojson) {
    return "ST_GeomFromGeoJSON('" + geojson + "')";
};

exports.simplify = function(geom, tolerance) {
    return "ST_SimplifyPreserveTopology(" + geom +
        "," + tolerance + ")";
};

exports.intersection = function(geom1, geom2) {
    return "ST_Intersection(" + geom1 + "," + geom2 + ")";
};

exports.whereBox = function(p1, p2) {
    var box = "";
    if (p1 && p2) {
        box = exports.box(p1[0], p1[1], p2[0], p2[1]);
        box = "%g && " + box;
        return box;
    } else {
        return null;
    }
};
