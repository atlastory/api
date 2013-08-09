module.exports = function(match, resources) {

    match('/', 'home#index');

    resources('/map/:mid/layer', 'layer');
    match('/map/:mid/layer/:id/geojson',  'layer#geojson');
    match('/map/:mid/layer/:id/topojson', 'layer#topojson');
    match('/geojson', 'layer#geojson');
    match('/topojson', 'layer#topojson');

};
