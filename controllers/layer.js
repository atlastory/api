var Layer = require('../models/Layer'),
    postgis = require('../lib/postgis'),
    util = require('../lib/utilities');

// GET /layers
exports.index = function(req, res) {
    var mId = 1;
    Layer.all(mId, function(err, layers) {
        if (err) res.send(500, err);
        else res.jsonp(layers);
    });
};

// GET /layers/:id
exports.show = function(req, res) {
    var id = req.param("id");
    Layer.find(id, function(err, layer) {
        if (err) res.send(500, err);
        else res.jsonp(layer[0]);
    });
};

// POST /layers/:id
// wiki model
// exports.create

// PUT /layers/:id
// wiki model
// exports.update

// DELETE /layers/:id
// wiki model
// exports.destroy
