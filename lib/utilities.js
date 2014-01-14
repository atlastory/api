var _ = require('underscore'),
    topojson = require('topojson');

exports.replace = function(string, values) {
    values.forEach(function(v,i){
        i++;
        string = string.replace(new RegExp("%"+i,"g"),v);
    });
    return string;
};

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
            delete shape.period;
        var feature = {
            "type": "Feature",
            "properties": _.extend(shape, extras),
            "geometry": geom
        };
        geoJSON.features.push(feature);
    });

    return geoJSON;
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
