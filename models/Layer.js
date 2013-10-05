var postgis = require('../lib/postgis'),
    db = require('../db/db'),
    gis = require('../lib/gis.utilities');

var Layer = db.mysql.model("layers");

var LayerDB = {
    methods: {
        table: function() {
            return this.short_name + '_' + this.id;
        },
        getGeoJSON: getGeoJSON,
        getTopoJSON: function(options, callback) {
            this.getGeoJSON(options, function(err, geojson) {
                if (err) callback(err);
                else callback(null, gis.convertTopoJSON(geojson));
            });
        }
    }
};


Layer._find = Layer.find;
Layer.find = function(id, callback) {
    id = parseFloat(id);
    return this._find(id, function(err, res) {
        if (res) {
            res = res[0];
            res.table = res.short_name + '_' + res.id;
        }
        callback(err, res);
    });
};

Layer._all = Layer.all;
Layer.all = function(mapId, callback) {
    return this.where({map_id: mapId}, callback);
};

function getGeoJSON (options, callback) {
    /* Get's GeoJSON for a layer
     * table STRING layer table name
     * shape STRING layer shape type
     * pid  INT   period id
     * p1   ARRAY [x,y] bottom left (optional)
     * p2   ARRAY [x,y] top right   (optional)
     * zoom INT   zoom level        (optional)
     */
    var table = options.table,
        shape = options.shape,
        pid = options.pid,
        p1 = options.p1 || null,
        p2 = options.p2 || null,
        z = options.hasOwnProperty('zoom') ? parseFloat(options.zoom) : null,
        geom = "%g", box = "";

    if (p1 && p2) {
        box = gis.box(p1[0], p1[1], p2[0], p2[1]);
        geom = gis.intersection(box, geom);
        box = "%g && " + box;
    }
    // @TODO: http://trac.osgeo.org/postgis/wiki/UsersWikiSimplifyPreserveTopology
    if (z !== null && z !== undefined && isNaN(z)) {
        var s = 0.25; // Simplify intensity
        if (z/8 > 1) z = 1;
        else z = z / 8;
        z = s - z * s;
        geom = gis.simplify(geom, z);
    }

    postgis.getShapes({
        table: table,
        type: shape,
        period: pid,
        properties: ["gid", "name"],
        geom: gis.asGeoJSON(geom),
        where: [box]
    }, function(err, shapes) {
        if (err) callback(err);
        else callback(null, gis.buildGeoJSON(shapes));
    });
}

Layer.getGeoJSON = function(id, options, callback) {
    if (!id) callback(new Error('Need layer ID!'));
    else this.find(id, function(err, layer) {
        if (err) callback(err);
        else {
            options.table = layer.table;
            options.shape = layer.shape;
            getGeoJSON(options, callback);
        }
    });
};

Layer.getTopoJSON = function(id, options, callback) {
    this.getGeoJSON(id, options, function(err, geojson) {
        if (err) callback(err);
        else callback(null, gis.convertTopoJSON(geojson));
    });
};

module.exports = Layer;
