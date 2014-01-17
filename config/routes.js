module.exports = function(match, resources) {

    match('/', 'home#index');

    // Layers
    resources('/layers', 'layer');

    // Periods
    resources('/layers/:lid/periods', 'period');
    match('/layers/:lid/periods/:pid/shapes.:type(json|geojson|topojson)', 'period#shapes');
    match('/geojson', 'period#geojson');
    match('/topojson', 'period#topojson');

    // Shapes
    match('/layers/:lid/periods/:pid/shapes/:id.:type(json|geojson|topojson)', 'shape#show');

    // Changesets
    resources('/changeset', 'changeset');
    match('/changeset/:id/commit', 'changeset#commit', {via: 'post'});
    match('/changeset/:id/finish', 'changeset#commit', {via: 'post'});

};
