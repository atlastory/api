var _ = require('lodash'),
    pg = require('../db/db').pg,
    util = require('../lib/utilities'),
    geojson = require('../lib/geojson');


var Period = module.exports = pg.model("periods", {
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
Period.importGeoJSON = function(id, options) {
    if (options.type == 'FeatureCollection') {
        options = { geojson: options };
    }
    options.period = id;

    return geojson.import(options);
};

Period.addMethod('importGeoJSON', function(options) {
    return Period.importGeoJSON(this.id, options);
});

Period.getGeoJSON = function(id, options) {
    /* Get's GeoJSON for a period/layer
     * type   INT    type ID
     * bbox   INT[]  [west, south, east, north] (optional)
     * zoom   INT    zoom level                 (optional)
     */
     options.period = id;
     return geojson.export(options);
};

Period.addMethod('getGeoJSON', function(options) {
    return Period.getGeoJSON(this.id, options);
});

Period.getTopoJSON = function(id, options) {
    return this.getGeoJSON(id, options).then(function(geojson) {
        return util.convertTopoJSON(geojson);
    });
};

Period.addMethod('getTopoJSON', function(options) {
    return Period.getTopoJSON(this.id, options);
});
