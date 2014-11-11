module.exports = function(match, resources) {

match('/', 'home#index');

apiVersion1('');    // Most recent version
apiVersion1('/v1');

function apiVersion1(v) {

    // Changesets
    match(v + '/changesets/:id',        'changeset#show');
    match(v + '/changesets/:id.:format(json|txt)', 'changeset#show');
    match(v + '/changesets',            'changeset#create', { via: 'post' });
    match(v + '/changesets/create',     'changeset#create', { via: 'put' });
    match(v + '/changesets/:id',        'changeset#create', { via: 'put' });
    match(v + '/changesets/:id/commit', 'changeset#commit', { via: 'post' });
    match(v + '/changesets/:id/close',  'changeset#commit', { via: 'put' });

    // Time periods
    resources(v + '/periods', 'period');
    match(v + '/periods/:pid/:type.:format(json|geojson|topojson)', 'period#shapes');
    match(v + '/year/:year/:type.:format(json|geojson|topojson)', 'period#year');
    match(v + '/geojson', 'period#geojson');
    match(v + '/topojson', 'period#topojson');

    // Nodes, Ways, Shapes
    // resources(v + '/nodes', 'node');
    // resources(v + '/ways', 'way');
    // resources(v + '/shapes', 'shape');
    // match('/shapes/:id.json', 'shape#show');
    // match('/shapes/:id.:format(geojson|topojson)', 'shape#geo');

    // Levels & Types
    resources(v + '/levels', 'level');
    resources(v + '/types', 'type');
    match(v + '/levels/:id/types', 'level#types');

    // Sources
    resources(v + '/sources', 'source');

    // Users
    // match(v + '/@:username', 'user#profile');
}

};
