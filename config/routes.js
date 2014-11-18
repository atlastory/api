
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
    get (v + '/periods.?:format(json|html)?',     'period#index');
    get (v + '/periods/:id.?:format(json|html)?', 'period#show');
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
    get (v + '/levels.?:format(json|html)?',     'level#index');
    get (v + '/levels/:id.?:format(json|html)?', 'level#show');
    get (v + '/types.?:format(json|html)?',      'type#index');
    get (v + '/types/:id.?:format(json|html)?',  'type#show');
    get (v + '/levels/:id/types', 'level#types');

    // Sources
    get (v + '/sources.?:format(json|html)?',     'source#index');
    get (v + '/sources/:id.?:format(json|html)?', 'source#show');

    // Users
    // match(v + '/@:username', 'user#profile');
}
