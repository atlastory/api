var postgis = require('../lib/postgis'),
    db = require('../db/db'),
    util = require('../lib/utilities');


var Period = module.exports = db.mysql.model("periods", {
    map: true,
    schema: {
        layer_id: { type: Number, allowNull: false },
        name: { type: String, allowNull: false },
        start: String,
        end: String,
        created_at: Date,
        updated_at: Date
    }
});

Period._all = Period.all;
Period.all = function(layerId, callback) {
    return this.where({layer_id: layerId}, callback);
};


Period.addMethod('getGeoJSON', function(options, callback) {
    /* Get's GeoJSON for a period/layer
     * p1   ARRAY [x,y] bottom left (optional)
     * p2   ARRAY [x,y] top right   (optional)
     * zoom INT   zoom level        (optional)
     */
    var p1 = options.p1 || null,
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
        period: this.id,
        layer: this.layer_id,
        properties: ["gid", "name"],
        geom: util.asGeoJSON(geom),
        where: [box]
    }, function(err, shapes) {
        if (err) callback(err);
        else callback(null, util.buildGeoJSON(shapes));
    });
});

Period.addMethod('getTopoJSON', function(options, callback) {
    this.getGeoJSON(options, function(err, geojson) {
        if (err) callback(err);
        else callback(null, util.convertTopoJSON(geojson));
    });
});

Period.addMethod('getShapeData', function(options, callback) {
    /* Get's shape data for a period/layer
     * p1   ARRAY [x,y] bottom left (optional)
     * p2   ARRAY [x,y] top right   (optional)
     */
    var p1 = options.p1 || null,
        p2 = options.p2 || null,
        box = "";

    if (p1 && p2) {
        box = util.box(p1[0], p1[1], p2[0], p2[1]);
        box = "%g && " + box;
    }

    postgis.getData({
        period: this.id,
        layer: this.layer_id,
        type: this.shape,
        where: [box]
    }, function(err, shapes) {
        if (err) callback(err);
        else callback(null, shapes);
    });
});
