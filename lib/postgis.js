var util = require('./utilities'),
    db  = require('../db/db');

var fn = exports;

var fixedCols = [
    "gid", "name", "description", "period",
    "datestart", "dateend", "tags"
];

// Query PG
fn.query = function(query, values, callback) {
    db.pg.query(query, values, callback);
};

function buildSelect(properties, table) {
    var select = "", props = [];
    if (properties) {
        properties.forEach(function(p) {
            props.push(table + '.' + p);
        });
        select += props.join(', ');
    } else {
        fixedCols.forEach(function(c) {
            select += table + '.' + c + ', ';
        });
        select += '%# ' + table + ".data AS data";
    }
    return select;
}

fn.getData = function(options, callback) {
    options.geom = "DATA";
    return this.getShapes(options, callback);
};

fn.getShapes = function(options, callback) {
    /*
     * layer      INT
     * type       STRING
     * period     INT     || either
     * shape      INT     || or
     * properties ARRAY   layer properties  (optional)
     * geom       STRING  geometry %g f*    (optional)
     * where      ARRAY   shape filter      (optional)
     */
    var query = "", select = "", ws = "", shapes = "",
        pid = options.period,
        sid = options.shape,
        lid = options.layer,
        type = options.type,
        properties = options.properties || null,
        where = options.where, table, geom;

    if (!lid && lid !== 0) return callback(new Error("Needs layer ID!"));
    if (!pid && !sid) return callback(new Error("Need either period or shape id!"));

    if (sid && !pid) shapes = " WHERE %1.gid = %4";
    else shapes = " WHERE %1.period = %3";

    table = "l_"+lid;
    select = buildSelect(properties, table);

    if (!where) ws = "";
    else if (typeof where === "string") ws = " AND " + where;
    else if (Array.isArray(where)) where.forEach(function(w) {
        if (w && w.replace(/\s/g,'') !== "") ws += " AND " + w;
    });

    // Format 'geom' column
    if (options.geom == 'DATA') geom = "";
    else geom = options.geom || '%g';
    if (geom !== "") geom = ', '+geom+' AS geom';

    query +=
        "SELECT " + select + geom +
        " FROM %2 JOIN %1 ON %1.shape = %2.gid" +
        shapes + ws;
    query = query.replace(/%g/g, "%2.geom");

    query = util.replace(query, [table, type, pid, sid]);

    fn.query(query, function(err, shapes) {
        if (err) callback(err);
        else {
            if (shapes[0] && shapes[0].hasOwnProperty("data"))
                shapes = util.convertData(shapes);
            callback(null, shapes);
        }
    });
};

