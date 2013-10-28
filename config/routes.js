module.exports = function(match, resources) {

    match('/', 'home#index');

    resources('/layers', 'layer');
    match('/layers/:id/geojson',  'layer#geojson');
    match('/layers/:id/topojson', 'layer#topojson');
    match('/geojson', 'layer#geojson');
    match('/topojson', 'layer#topojson');

    match('/layers/:lid/shapes', 'shape#index');
    match('/layers/:lid/shapes/:id', 'shape#show');

    resources('/changeset', 'changeset');
    match('/changeset/:id/commit', 'changeset#commit', {via: 'post'});
    match('/changeset/:id/finish', 'changeset#commit', {via: 'post'});

};
