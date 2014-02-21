var GCR = require('grand-central-records'),
    env = process.env.ENV_VARIABLE || "development",
    msc = require('./atlastory-db')[env],
    pgc = require('./atlastory-db').postgis;

var verbose = true,
    mysql = new GCR(msc, { verbose: verbose }),
    pg    = new GCR(pgc, { verbose: verbose, idAttribute: 'id' });


var fn = exports;

fn.mysql = mysql;
fn.pg = pg;

fn.Map = mysql.model("maps");
fn.Layer = mysql.model("layers");
fn.Period = mysql.model("periods");
fn.Source = mysql.model("sources");

fn.Node = pg.model("nodes");
fn.Way = pg.model("ways");
fn.Shape = pg.model("shapes");

