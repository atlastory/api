module.exports = function(match, resources) {
    match('/', 'home#index');

    match('/v1/geojson', 'geojson#get');
    //match('/v1/geojson', '', {via: 'post'});

    //match('/v1/shape', 'shape#get');
};
