var pg = require('./lib/postgis');
var util = require('./lib/utilities');
var fs = require('fs');

/*
console.log(
	util.hstoreToJson('"a"=>"1", "b"=>"2"')
);
*/

pg.getShapes({
	layer: 0,
	type: 'point',
	shape: 10
}, function(err, res) {
	if (err) throw err;
	console.log(JSON.stringify(res));
});

