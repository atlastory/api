var db = require('../db/db'),
    util = require('../lib/utilities'),
    geojson = require('../lib/geojson');


var Period = module.exports = db.mysql.model("periods", {
    schema: {
        name: String,
        start_day:   { type: Number, allowNull: false, default: 1 },
        start_month: { type: Number, allowNull: false, default: 1 },
        start_year:  { type: Number, allowNull: false },
        end_day:     { type: Number, allowNull: false, default: 1 },
        end_month:   { type: Number, allowNull: false, default: 1 },
        end_year:    { type: Number, allowNull: false },
        created_at: Date,
        updated_at: Date
    }
});

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
