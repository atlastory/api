module.exports = function(match, resources) {

    match('/', 'home#index');

    var v = '/v1';

    // Types
    // resources('/layers', 'layer');

    // Periods
    resources(v + '/periods', 'period');
    // /periods/:pid/:type.:format(json|geojson|topojson)
    match(v + '/geojson', 'period#geojson');
    match(v + '/topojson', 'period#topojson');

    // /nodes/:id
    // /ways/:id
    // /shapes/:id || /shapes/:id.:format(json|geojson|topojson)

    // Changesets
    //resources(v + '/changeset', 'changeset');
    //match(v + '/changeset/:id/commit', 'changeset#commit', {via: 'post'});
    //match(v + '/changeset/:id/finish', 'changeset#commit', {via: 'post'});

};
