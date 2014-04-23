var _ = require('lodash');
var pg = require('./lib/postgis');
var util = require('./lib/utilities');
var db = require('./db/db');
var fs = require('fs');
var async = require('async');


var json = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "point", "a": "b" },
            "geometry": {
                "type": "Point",
                "coordinates": [0.5212, 4.1789]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "line", "a": "b" },
            "geometry": {
                "type": "LineString",
                "coordinates": [[1,1], [2,2], [3,3], [4,4], [10,10]]
            } // 2, 3, 4, 5, 6
        },
        {
            "type": "Feature",
            "properties": { "name": "poly", "a": 2.8866 },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[20.1, 20.1], [16.9, 16.9], [10, 10], [20.1, 20.1]]]
            } // 10, 11, 6, 10
        },
        {
            "type": "Feature",
            "properties": { "name": "multi poly", "a": 16.5673 },
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [[[[6.6,6.6],[7.7,7.7],[6.6,2.2],[6.6,6.6]], [[1.1, 1.1],[2.2,2.2],[2.2,0.54321],[1.1,1.1]]],[[[6.6,6.6],[7.7,7.7],[7.7,2],[6.6,6.6]]]]
            } // 7, 8, 9, 7 -- 7, 8, 12, 7
        }
    ]
};

var geojson = require('./lib/geojson');

console.time("finish");

/*
geojson.import({
    geojson: json,
    period: 1,
    user: 1
}, function(err) {
    if (err) throw err;
    console.timeEnd("finish");
});
*/

geojson.export({
    period: 1
}, function(err, geoJSON) {
    if (err) throw err;
    console.timeEnd("finish");
    console.log(JSON.stringify(geoJSON));
});


// http://stackoverflow.com/questions/17930204/simple-file-upload-to-s3-using-aws-sdk-and-node-express?rq=1
// http://stackoverflow.com/questions/17218506/file-upload-to-a-node-js-server?lq=1
// http://stackoverflow.com/questions/22062115/nodejs-how-to-send-a-file-via-request-post

