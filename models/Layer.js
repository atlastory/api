var atlastory = require('node-api'),
    Step = require('step'),
    gis = atlastory.gis;

function Layer() {}

var fn = Layer.prototype;

fn.find = function(id, callback) {
    return atlastory.getLayerData(id, callback);
};

// fn.all
//

fn.getGeoJSON = function(options, callback) {
    /* Get's GeoJSON for a layer
     * id   INT   layer id
     * pid  INT   period id
     * p1   ARRAY [x,y] bottom left (optional)
     * p2   ARRAY [x,y] top right   (optional)
     * zoom INT   zoom level        (optional)
     */
    var Layer = this,
        id = options.id,
        pid = options.pid,
        p1 = options.p1 || null,
        p2 = options.p2 || null,
        z = (options.hasOwnProperty('zoom')) ? options.zoom : null,
        geom = "%g", box = "";

    if (p1 && p2) {
        box = gis.box(p1[0], p1[1], p2[0], p2[1]);
        geom = gis.intersection(box, geom);
        box = "%g && " + box;
    }
    // @TODO: http://trac.osgeo.org/postgis/wiki/UsersWikiSimplifyPreserveTopology
    if (z !== null && z !== undefined) {
        var s = 0.25; // Simplify intensity
        if (z/8 > 1) z = 1;
        else z = z / 8;
        z = s - z * s;
        geom = gis.simplify(geom, z);
    }

    atlastory.getShapes({
        layer: id,
        period: pid,
        properties: ["gid", "name"],
        geom: gis.asGeoJSON(geom),
        where: [box]
    }, function(err, shapes, lyr) {
        if (err) callback(err);
        else callback(null, gis.buildGeoJSON(shapes, {
            table: lyr.table
        }));
    });
};

fn.getTopoJSON = function(options, callback) {
    this.getGeoJSON(options, function(err, geojson) {
        if (err) callback(err);
        else callback(null, gis.convertTopoJSON(geojson));
    });
};

module.exports = new Layer();
