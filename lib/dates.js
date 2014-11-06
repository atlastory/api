var _ = require('lodash'),
    util = require('../lib/utilities'),
    geojson = require('../lib/geojson');

// Format ±?YYYYY-MM-DD
var MATCH = exports.MATCH = {
    // YEAR: matches 1st block prior to '-': '2014', '+2014', '+0069', '-1200', '415'
    year: /^[-\+]?\d+/,

    // MONTH: matches MM ranging 01-12 (will match 2 duplicate results)
    month: /\b(0[1-9]|1[0-2])(?=-\d+$)/,

    // DAY: matches DD ranging 00-31
    day: /(0[1-9]|[12]\d|3[01])$/
};

exports.parse = function(date) {
    return {
        year:  parseFloat(date.match(MATCH.year)),
        month: parseFloat(date.match(MATCH.month)) || null,
        day:   parseFloat(date.match(MATCH.day)) || null
    };
};

exports.getShapeData = function() {};

exports.getGeoJSON = function(date, options) {
    /* Get's GeoJSON for a date
     * type   INT[]  type ID
     * bbox   INT[]  [west, south, east, north] (optional)
     * zoom   INT    zoom level                 (optional)
     */
     options.year = this.parse('' + date).year;
     return geojson.export(options);
};

exports.getTopoJSON = function(date, options) {
    return this.getGeoJSON(date, options).then(function(geojson) {
        return util.convertTopoJSON(geojson);
    });
};
