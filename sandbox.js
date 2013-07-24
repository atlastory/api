var Layer = require('./models/Layer');
var fs = require('fs');

Layer.getGeoJSON({
	id: 61,
	pid: 1,
	p1: [-13.7109375,
          32.84267363195431],
	p2: [37.96875,
          58.26328705248601],
    zoom: 0
}, function(err, json) {
	if (err) throw err;
	fs.writeFileSync('../geojsons/zoom0.geojson', JSON.stringify(json));
});
