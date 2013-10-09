var gis = require('./gis.utilities'),
    db  = require('../db/db');

var fn = exports;

// Query PG
fn.query = function(query, values, callback) {
    db.pg.query(query, values, callback);
};

fn.getShapes = function(options, callback) {
    /*
     * table      STRING
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
        table = options.table,
        type = options.type,
        properties = options.properties || null,
        geom = options.geom || "%g",
        where = options.where;

    if (!table) return callback(new Error("Needs layer table name!"));
    if (!type) return callback(new Error("Needs shape type!"));
    if (!pid && !sid) return callback(new Error("Need either period or shape id!"));

    if (sid && !pid) shapes = " WHERE %1.gid = %4";
    else shapes = " WHERE %1.period = %3";

    if (properties) properties.forEach(function(p) {
        select += table + "." + p + ", ";
    });
    else select += table + ".*, ";

    if (!where) ws = "";
    else if (typeof where === "string") ws = " AND " + where;
    else if (Array.isArray(where)) where.forEach(function(w) {
        if (w.replace(/\s/g,'') !== "") ws += " AND " + w;
    });

    query +=
        "SELECT " + select + geom +
        " AS geom FROM %2 JOIN %1 ON %1.shape = %2.gid" +
        shapes + ws;
    query = query.replace(/%g/g, "%2.geom");

    query = gis.replace(query, [table, type, pid, sid]);

    fn.query(query, function(err, shapes) {
        callback(err, shapes);
    });
};

