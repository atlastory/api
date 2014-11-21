var Node = require('../models/Node'),
    err = require('../lib/errors');


// GET /nodes
exports.index = function(req, res) {
    var bbox = req.param("bbox");

    /*Node.where({}).then(function(nodes) {
        res.jsonp(nodes);
    }).fail(err.send(res));*/
    err.forbidden(res)("Feature not available yet");
};

// GET /nodes/:id
exports.show = function(req, res) {
    var id = req.param("id");
    Node.find(id).thenOne(function(node) {
        if (!node) return err.notFound(res)('Node '+id+' not found');
        res.jsonp(node);
    }).fail(err.send(res));
};

