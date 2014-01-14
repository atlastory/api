var postgis = require('../lib/postgis'),
    db = require('../db/db'),
    util = require('../lib/utilities');


var Layer = module.exports = db.mysql.model("layers", {
    map: true,
    schema: {
        map_id: { type: Number, default: 1 },
        name: { type: String, allowNull: false },
        color: String,
        level: Number,
        shape: { type: String, allowNull: false },
        short_name: String,
        created_at: Date,
        updated_at: Date
    },
    getters: {
        table: function() {
            return 'l_' + this.id;
        }
    }
});

Layer._find = Layer.find;
Layer.find = function(ids, callback) {
    if (parseFloat(ids) === 0) {
        var Test = Layer.new({
            id: 0,
            name: 'test',
            shape: 'point'
        });
        Test.id = 0;
        Test.table = "l_0";
        callback(null, Test);
    }
    else return this._find(ids, callback);
};

Layer._all = Layer.all;
Layer.all = function(mapId, callback) {
    return this.where({map_id: mapId}, callback);
};

Layer.addMethod('getGeoJSON', function(options, callback) {
    /* Get's GeoJSON for a layer
     * pid  INT   period id
     * p1   ARRAY [x,y] bottom left (optional)
     * p2   ARRAY [x,y] top right   (optional)
     * zoom INT   zoom level        (optional)
     */
    var pid = options.pid,
        p1 = options.p1 || null,
        p2 = options.p2 || null,
        z = options.hasOwnProperty('zoom') ? parseFloat(options.zoom) : null,
        geom = "%g", box = "";

    // @TODO: http://trac.osgeo.org/postgis/wiki/UsersWikiSimplifyPreserveTopology
    if (z !== null && z !== undefined && isNaN(z)) {
        var s = 0.25; // Simplify intensity
        if (z/8 > 1) z = 1;
        else z = z / 8;
        z = s - z * s;
        geom = util.simplify(geom, z);
    }

    if (p1 && p2) {
        box = util.box(p1[0], p1[1], p2[0], p2[1]);
        geom = util.intersection(box, geom);
        box = "%g && " + box;
    }

    postgis.getShapes({
        layer: this.id,
        period: pid,
        type: this.shape,
        properties: ["gid", "name"],
        geom: util.asGeoJSON(geom),
        where: [box]
    }, function(err, shapes) {
        if (err) callback(err);
        else callback(null, util.buildGeoJSON(shapes));
    });
});

Layer.addMethod('getTopoJSON', function(options, callback) {
    this.getGeoJSON(options, function(err, geojson) {
        if (err) callback(err);
        else callback(null, util.convertTopoJSON(geojson));
    });
});

Layer.addMethod('getShapeData', function(options, callback) {
    /* Get's shape data for a layer
     * pid  INT   period id
     * p1   ARRAY [x,y] bottom left (optional)
     * p2   ARRAY [x,y] top right   (optional)
     */
    var pid = options.pid,
        p1 = options.p1 || null,
        p2 = options.p2 || null,
        box = "";

    if (p1 && p2) {
        box = util.box(p1[0], p1[1], p2[0], p2[1]);
        box = "%g && " + box;
    }

    postgis.getData({
        layer: this.id,
        period: pid,
        type: this.shape,
        where: [box]
    }, function(err, shapes) {
        if (err) callback(err);
        else callback(null, shapes);
    });
});
