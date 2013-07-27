module.exports = function(match, resources) {
	var v = "/v1";

    match('/', 'home#index');

    match(v+'/layer/:id/geojson', 'layer#geojson');
    match(v+'/layer/:id/topojson', 'layer#topojson');

    //match(v+'/shape', 'shape#get');
};
