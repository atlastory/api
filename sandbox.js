var _ = require('underscore');
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
        }, {
            "type": "Feature",
            "properties": { "name": "line", "a": "b" },
            "geometry": {
                "type": "LineString",
                "coordinates": [[1,1], [2,2], [3,3], [4,4], [10,10]]
            } // 2, 3, 4, 5, 6
        }, {
            "type": "Feature",
            "properties": { "name": "poly", "a": 2.8866 },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[20.1, 20.1], [16.9, 16.9], [10, 10], [20.1, 20.1]]]
            } // 10, 11, 6, 10
        }, {
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

geojson.import(json, function(err) {
    if (err) throw err;
    console.timeEnd("finish");
});



/*
Creating a node:
1) INSERT INTO nodes (latitude, longitude) VALUES (2,2) RETURNING id;
2) Store id in array

Creating  a way:
1) INSERT INTO ways (id) VALUES(DEFAULT) RETURNING id;
2) Store id
3) n * [ INSERT INTO nodes (latitude, longitude) VALUES (3,3) RETURNING id;
INSERT INTO way_nodes (node_id, way_id, sequence_id) VALUES (
    LASTVAL(),
    [wayId],
    [arrayId]
); ]

Finishing shape:
1) INSERT INTO shapes (period_id, layer, name ...) VALUES (...) RETURNING id;
2) Store id
3) n * [ INSERT INTO shape_relations (shape_id, member_type, member_id, sequence_id) VALUES (
    [shapeId],
    ['Node'|'Way'|'Shape'],
    [id],
    [arrayId]
); ]

Getting way nodes:
SELECT nodes.*
  FROM nodes JOIN way_nodes
  ON nodes.id = way_nodes.node_id
  WHERE way_nodes.way_id = [wayId]
  ORDER BY way_nodes.sequence_id;
*/

