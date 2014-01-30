var _ = require('underscore'),
    Step = require('step'),
    log = function(){},
    gis = require('./utilities'),
    db = require('../db/db'),
    wkt = require('terraformer-wkt-parser');

function getShapeModel(type) {
    // Translates GeoJSON type into PG table model
    if (/Point/.test(type)) return db.Point;
    if (/Line/.test(type)) return db.Line;
    if (/Polygon/.test(type)) return db.Polygon;
    return new Error("Shape type not recognized");
}

function geoJSONToWKT(geojson) {
    return wkt.convert(geojson);
}

function addShapeData(layer, data, callback) {
    // Create new data object w/ fixed columns
    var newData = {
        period:      data.period,
        shape:       data.shape,
        name:        data.name || '',
        description: data.description || '',
        datestart:   data.datestart || '',
        dateend:     data.dateend || '',
        tags:        data.tags || [],
        data: null,
    },  hstore = [],
        keys = _.keys(newData);

    // Create hstore with extra data
    for (var key in data) {
        if (!_.contains(keys, key))
            hstore.push(key+' => "'+db.pg.engine.escape(data[key])+'"');
    }
    newData.data = { noEscape: "'"+hstore.join(", ")+"'" };

    db.pg.setTable('l_'+layer).returning("gid").create(newData, function(err, row) {
        if (err) callback(err);
        else callback(null, row[0].gid);
    });
}

exports.add = function(d, callback) {
    var period = d.period,
        layer = (typeof d.layer === 'number') ? d.layer : 0,
        type = d.type.split(',')[1],
        Shape = getShapeModel(type),
        data = JSON.parse(d.data),
        geom = JSON.parse(d.geom_diff),
        sources = data.sources || [4],
        wkt;

    callback = callback || function(){};
    geom = { type: type, coordinates: geom };
    wkt = gis.fromWKT(geoJSONToWKT(geom));

    Step(function() {
        Shape.create({
            geom: { noEscape: wkt },
            layers: [layer],
            periods: [period],
            sources: sources
        }).returning("gid", this);
    }, function(err, masterShape) {
        if (err) log(err, "#addShape > master shape", callback);
        else {
            data.period = period;
            data.shape = masterShape[0].gid;
            addShapeData(layer, data, this);
        }
    }, function(err, insertId) {
        if (err) log(err, "#addShape", callback);
        else callback(null, insertId);
    });
};

exports.edit = function(d, callback) {
    callback(null);
};

exports.delete = function(d, callback) {
    callback(null);
};
