#!/usr/bin/env node
/*
TODO: Use https://www.npmjs.org/package/node-pg-migrate
to allow JS migration files in addition to SQL
*/

var fs = require("fs");
var path = require("path");
var _ = require("lodash");
var Q = require("q");
var semver = require("semver");

var util = require('../lib/utilities');
var pg = require('../services/db').pg;
var config = require('../config/config');

var migrationFolder = path.join(__dirname, '../db/migrate');
var dbName = config.testing ? config.database.test : config.database.database;
var readFile = Q.denodeify(fs.readFile);
var readdir = Q.denodeify(fs.readdir);

// Turn off logging
pg.engine.verbose = false;

// Get command arguments
var args = process.argv;
args = (args[0] == 'node') ? args.slice(2) : args.slice(1);
var command = args[0];


function sortBySemVer(filelist) {
    return filelist.map(function(f) {
        return {
            version: semver.clean(f.split('#')[0]),
            file: path.join(migrationFolder, f)
        };
    }).sort(function(a, b) {
        if (semver.lt(a.version, b.version)) return -1;
        if (semver.gt(a.version, b.version)) return 1;
        return 0;
    });
}

function migrateFile(migration) {
    console.log('up :', path.basename(migration.file));

    // Execute migration SQL
    return readFile(migration.file).then(function(sql) {
        return pg.query(sql + '');
    })
    // Update DB version if it exists
    .then(function() {
        if (!migration.version) return true;
        return pg.setTable('config').where({ key: 'version' })
        .update({ value: migration.version });
    })
    .thenResolve(true);
}

function Migrate(fromVersion, toVersion) {
    console.log('Migrating database "%s" (v%s)...', dbName, fromVersion);

    readdir(migrationFolder)
    .then(sortBySemVer)
    .then(function(migrations) {
        toVersion = _.find(migrations, function(m) {
            if (!toVersion) return false;
            return semver.eq(m.version, toVersion);
        });
        toVersion = toVersion || migrations[migrations.length - 1];

        if (semver.lt(fromVersion, toVersion.version)) {
            var idx = _.findIndex(migrations, function(m) {
                return semver.gt(m.version, fromVersion);
            });
            // Remove previous versions
            migrations.splice(0, idx);
            // Remove later versions
            var stopIdx = migrations.indexOf(toVersion) + 1;
            migrations.splice(stopIdx, migrations.length - stopIdx);

            return util.promiseSeries(migrations, migrateFile);
        }
    })
    .then(function(migrations) {
        if (_.every(migrations)) console.log('migration : complete');
        else console.error('migration : failed');
    })
    .fail(console.error)
    .fin(pg.end);
}


// Initialize database structure
// !! Clears all existing tables & data
if (command == 'init') {
    if (args[1] != '-F') {
        console.log('"init" deletes all existing tables and data!');
        console.log('Use -F to force initialization');
    }

    console.log('Initializing database structure in:', dbName);

    util.promiseSeries([
        { file: path.join(__dirname, '../db/structure.sql') },
        { file: path.join(__dirname, '../db/seeds.sql') }
    ], migrateFile)
    .thenResolve('migration : complete')
    .then(console.log)
    .fail(console.error)
    .fin(pg.end);
}

// Migrate to given or most recent version
else {
    var Migrate;
    var toVersion = semver.valid(command) ? semver.clean(command) : null;

    pg.setTable('config').where({ key: 'version' })
    .then(function(res) {
        var currentVer = res[0] ? semver.clean(res[0].value) : null;
        if (!semver.valid(currentVer)) throw 'Database version "'+currentVer+'" invalid';
        return Migrate(currentVer, toVersion);
    })
    .catch(function(err) {
        var dbRegEx = new RegExp(dbName + '".does.not.exist');
        if (dbRegEx.test(err.message))
            err = 'Database "' + dbName + '" must be created first';
        if (/"config".does.not.exist/.test(err.message))
            return Migrate('0.0.0', toVersion);

        console.error(err);
        pg.end();
    });
}
