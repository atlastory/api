
match('/', 'home#index');

apiVersion1('');    // Most recent version
apiVersion1('/v1');

function apiVersion1(v) {

    // all (v + '*', requireAuth, loadUser);

    // Changesets
    get (v + '/changesets/:id.?:format(json|txt)?', 'changeset#show');
    post(v + '/changesets',            'changeset#create');
    put (v + '/changesets/create',     'changeset#create');
    put (v + '/changesets/:id',        'changeset#create');
    post(v + '/changesets/:id/commit', 'changeset#commit');
    put (v + '/changesets/:id/close',  'changeset#commit');

    // Time periods
    resources(v + '/periods', 'period');
    match(v + '/periods/:pid/:type.?:format(json|geojson|topojson)?', 'period#shapes');
    match(v + '/year/:year/:type.?:format(json|geojson|topojson)?', 'period#year');
    match(v + '/geojson',  'period#geojson');
    match(v + '/topojson', 'period#topojson');
    // match(v + '/year/:year/periods')

    // Nodes, Ways, Shapes
    get (v + '/nodes',     'node#index');
    get (v + '/nodes/:id', 'node#show');
    get (v + '/ways',      'way#index');
    get (v + '/ways/:id.?:format(json|geojson|topojson)?', 'way#show');
    get (v + '/shapes',    'shape#index');
    get (v + '/shapes/:id.?:format(json|geojson|topojson)?', 'shape#show');

    // Levels & Types
    resources(v + '/levels', 'level');
    resources(v + '/types', 'type');
    match(v + '/levels/:id/types', 'level#types');

    // Sources
    resources(v + '/sources', 'source');

    // Users
    // match(v + '/@:username', 'user#profile');
}
