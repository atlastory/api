module.exports = function(match, resources) {

    match('/', 'home#index');

    resources('/layers', 'layer');

    match('/layers/:id/shapes.:type(json|geojson|topojson)', 'layer#shapes');
    match('/geojson', 'layer#geojson');
    match('/topojson', 'layer#topojson');
    match('/layers/:lid/shapes/:id.:type(json|geojson|topojson)', 'shape#show');

    resources('/changeset', 'changeset');
    match('/changeset/:id/commit', 'changeset#commit', {via: 'post'});
    match('/changeset/:id/finish', 'changeset#commit', {via: 'post'});

};
