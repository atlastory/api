var fs = require("fs"),
	path = require('path'),
	markdown = require("markdown").markdown,
	file, html;

// Converts markdown file in 'docs' folder into HTML
// PARAMETERS:
// name (STRING)  (no file extension)
// callback

module.exports = function(name, callback) {
	file = path.join(__dirname, '..', 'docs', name+'.md');
	fs.readFile(file, function(err, md) {
		if (err) callback(err);
		else {
			html = markdown.toHTML(''+md);
			callback(null, html);
		}
	});
};
