var db = require('../db/db'),
    util = require('../lib/utilities'),
    geojson = require('../lib/geojson');


var Period = module.exports = db.mysql.model("periods", {
    map: true,
    schema: {
        layer_id: { type: Number, allowNull: false },
        name: { type: String, allowNull: false },
        start_day: { type: String, allowNull: false, default: '' },
        end_day: { type: String, allowNull: false, default: '' },
        created_at: Date,
        updated_at: Date
    }
});

Period._all = Period.all;
Period.all = function(layerId, callback) {
    return this.where({layer_id: layerId}, callback);
};

// Directly import GeoJSON
Period.importGeoJSON = function(id, options, callback) {
    if (options.type == 'FeatureCollection') {
        options = { geojson: options };
    }
    options.period = id;
    geojson.import(options, callback);
};
Period.addMethod('importGeoJSON', function(options, callback) {
    if (options.type == 'FeatureCollection') {
        options = { geojson: options };
    }
    options.period = this.id;
    geojson.import(options, callback);
});

Period.addMethod('getGeoJSON', function(options, callback) {
    /* Get's GeoJSON for a period/layer
     * p1   ARRAY [x,y] bottom left (optional)
     * p2   ARRAY [x,y] top right   (optional)
     * zoom INT   zoom level        (optional)
     */
    /*var p1 = options.p1 || null,
        p2 = options.p2 || null,
        z = options.hasOwnProperty('zoom') ? parseFloat(options.zoom) : null,
        geom = "%g", box = "";

    if (p1 && p2) {
        box = util.box(p1[0], p1[1], p2[0], p2[1]);
    }*/

});

Period.addMethod('getTopoJSON', function(options, callback) {
    this.getGeoJSON(options, function(err, geojson) {
        if (err) callback(err);
        else callback(null, util.convertTopoJSON(geojson));
    });
});
