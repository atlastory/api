module.exports = function(match, resources) {

match('/', 'home#index');

apiVersion1('');    // Most recent version
apiVersion1('/v1');

function apiVersion1(v) {

    // Periods
    resources(v + '/periods', 'period');
    match(v + '/periods/:period/:type.:format(json|geojson|topojson)', 'period#geojson');
    match(v + '/geojson', 'period#geojson');
    match(v + '/topojson', 'period#topojson');

    // /nodes/:id
    // /ways/:id
    // /shapes/:id || /shapes/:id.:format(json|geojson|topojson)

    // Changesets
    //resources(v + '/changeset', 'changeset');
    //match(v + '/changeset/:id/commit', 'changeset#commit', {via: 'post'});
    //match(v + '/changeset/:id/finish', 'changeset#commit', {via: 'post'});

    // Types
    resources(v + '/types', 'type');

    // Sources
    resources(v + '/sources', 'source');
}

};
