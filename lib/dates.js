var _ = require('lodash'),
    util = require('../lib/utilities'),
    geojson = require('../lib/geojson');

var match = {
    year: /-?\d+/
};

exports.getShapeData = function() {};

exports.getGeoJSON = function(date, options) {
    /* Get's GeoJSON for a date
     * type   INT[]  type ID
     * bbox   INT[]  [west, south, east, north] (optional)
     * zoom   INT    zoom level                 (optional)
     */
     date += '';
     options.year = '' + date.match(match.year);
     return geojson.export(options);
};

exports.getTopoJSON = function(date, options) {
    return this.getGeoJSON(date, options).then(function(geojson) {
        return util.convertTopoJSON(geojson);
    });
};
