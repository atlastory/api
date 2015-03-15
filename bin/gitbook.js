#!/usr/bin/env node
// Builds Gitbook documentation

var path = require("path");
var _ = require("lodash");
var Book = require('gitbook').Book;

var docsFolder = path.join(__dirname, '../docs');
var outputFolder = path.join(__dirname, '../assets/docs');

// Get command arguments
var args = process.argv;
args = (args[0] == 'node') ? args.slice(2) : args.slice(1);
var command = args[0];


if (command == "build") {
    var book = new Book(docsFolder, _.extend({}, {
        log: function() {},
        config: { output: outputFolder }
    }));

    return book.parse().then(function() {
        console.log("Generating docs with Gitbook...");
        return book.generate('website');
    }).then(function() {
        console.log("Documentation generated.")
        process.exit();
    }).fail(function(err) {
        console.error("failed:",err);
    });
}
