module.exports = function(match, resources) {

match('/', 'home#index');

apiVersion1('');    // Most recent version
apiVersion1('/v1');

function apiVersion1(v) {

    // Changesets
    match(v + '/changesets/:id',        'changeset#show');
    match(v + '/changesets',            'changeset#create', { via: 'post' });
    match(v + '/changesets/create',     'changeset#create', { via: 'put' });
    match(v + '/changesets/:id',        'changeset#create', { via: 'put' });
    match(v + '/changesets/:id/commit', 'changeset#commit');
    match(v + '/changesets/:id/close',  'changeset#commit');

    // Periods
    resources(v + '/periods', 'period');
    match(v + '/periods/:pid/:type.:format(json|geojson|topojson)', 'period#shapes');
    match(v + '/geojson', 'period#geojson');
    match(v + '/topojson', 'period#topojson');
    // match(v + '/year/:year/:type.:format(json|geojson|topojson)', 'period#date')

    // /nodes/:id
    // /ways/:id
    // /shapes/:id || /shapes/:id.:format(json|geojson|topojson)

    // Levels & Types
    resources(v + '/levels', 'level');
    resources(v + '/types', 'type');

    // Sources
    resources(v + '/sources', 'source');
}

};
