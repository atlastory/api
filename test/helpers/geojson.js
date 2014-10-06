exports.invalid = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "line", "a": "b" },
            "geometry": {
                "type": "Point",
                "coordinates": [[[0.5212, 4.1789]]]
            }
        }
    ]
};

exports.point = {
    "type": "FeatureCollection",
    "period": 101,
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "point", "a": "b", "type": "Country", "ABBREV": "ln" },
            "geometry": {
                "type": "Point",
                "coordinates": [0.5212, 4.1789]
            }
        }
    ]
};

exports.multiPoint = {
    "type": "FeatureCollection",
    "period": 102,
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "multi point" },
            "geometry": {
                "type": "MultiPoint",
                "coordinates": [[60, 60], [40, 40]]
            }
        }
    ]
};

exports.line = {
    "type": "FeatureCollection",
    "period": 103,
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "line", "a": "b" },
            "geometry": {
                "type": "LineString",
                "coordinates": [[1,1], [2,2], [3,3], [4,4], [10,10]]
            }
        }
    ]
};

exports.multiline = {
    "type": "FeatureCollection",
    "period": 104,
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "multi line", "a": "b" },
            "geometry": {
                "type": "MultiLineString",
                "coordinates": [[[10,10], [14,14], [18,28]], [[22,22], [11,11], [14,14]]]
            }
        }
    ]
};

exports.polygon = {
    "type": "FeatureCollection",
    "period": 105,
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "poly", "a": 2.88 },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[20.1, 20.1], [16.9, 16.9], [10, 10], [20.1, 20.1]]]
            }
        }
    ]
};

exports.multiPolygon = {
    "type": "FeatureCollection",
    "period": 106,
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "multi poly",
                "a": 55,
                "start_year": 1986,
                "end_year": 2014
            },
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [[[[6.6,6.6],[7.7,7.7],[6.6,2.2],[6.6,6.6]], [[1.1, 1.1],[2.2,2.2],[2.2,0.54321],[1.1,1.1]]],[[[6.6,6.6],[7.7,7.7],[7.7,2],[6.6,6.6]]]]
            }
        }
    ]
};
