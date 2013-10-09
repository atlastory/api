var GCR = require('grand-central-records'),
    env = process.env.ENV_VARIABLE || "development",
    msc = require('./atlastory-db')[env],
    pgc = require('./atlastory-db').postgis;

var verbose = true,
    mysql = new GCR(msc, { verbose: verbose }),
    pg    = new GCR(pgc, { verbose: verbose });


var fn = exports;

fn.mysql = mysql;
fn.pg = pg;

fn.Map = mysql.model("maps");
fn.Layer = mysql.model("layers");
fn.Period = mysql.model("periods");
fn.Source = mysql.model("sources");

/*
fn.Layer = mysql.define('layer', {
    map_id: db.s.INTEGER,
    name:  { type: db.s.STRING, allowNull: false },
    color: { type: db.s.STRING, defaultValue: "" },
    level: db.s.INTEGER,
    shape: { type: db.s.STRING, allowNull: false },
    short_name: db.s.STRING,
    created_at: { type: db.s.DATE, allowNull: false },
    updated_at: { type: db.s.DATE, defaultValue: db.s.NOW, allowNull: false }
});

fn.Period = mysql.define('period', {
    map_id: fn.s.INTEGER,
    name:   fn.s.STRING,
    start: { type: fn.s.DATE, allowNull: false },
    end:   { type: fn.s.DATE, allowNull: false },
    created_at: { type: fn.s.DATE, allowNull: false },
    updated_at: { type: fn.s.DATE, defaultValue: fn.s.NOW, allowNull: false }
});

fn.Source = mysql.define('source', {
    name: fn.s.STRING,
    source: fn.s.STRING,
    created_at: { type: fn.s.DATE, allowNull: false },
    updated_at: { type: fn.s.DATE, defaultValue: fn.s.NOW, allowNull: false }
});
*/
