var map = require('./map'),
    layer = require('./layer'),
    period = require('./period'),
    shape = require('./shape');


exports.parse = function(directive) {
    var action = directive.action,
        object = directive.object;

    // Procedure for recording edits
    function callback(err) {
        var status = 'success';
        if (err) status = 'fail: ' + err;
        console.log(directive.toString()+' => '+status);
    }

    if (object == 'shape') {
        shape[action](directive, callback);
    } else if (object == 'layer') {
        layer[action](directive, callback);
    } else if (object == 'period') {
        period[action](directive, callback);
    } else if (object == 'map') {
        map[action](directive, callback);
    } else if (object == 'test') {
        callback(null);
    }
};
