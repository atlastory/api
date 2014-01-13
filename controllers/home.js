var md = require('../lib/md.parser');

exports.index = function(req, res) {
	md('index', function(err, html) {
		if (err) res.send(304, "Error rendering markdown");
		else {
			console.log("fuck node");
			res.render('index', {
			title: "Atlastory API",
			content: html
		});}
	});
};
