#!/usr/bin/env node

var repl = require("repl");
var fs = require("fs");
var path = require("path");

var c = repl.start({
    prompt: "api> ",
    input: process.stdin,
    output: process.stdout
}).on('exit', function() {});

c.context.util = require('../lib/utilities');
c.context.pg = require('../services/db').pg;
c.context.app = require('../app');
c.context.wiki = require('../lib/wiki');

// Includes all models
fs.readdirSync(path.join(__dirname,'..','models')).forEach(function(file) {
    c.context[path.basename(file, '.js')] = require(path.join(__dirname,'..','models',file));
});
