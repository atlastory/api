var Shape = require('../models/Shape'),
    util = require('../lib/utilities');


// GET /layers/:lid/shapes/:id.:type
exports.show = function(req, res) {
    var lid = req.param("lid"),
        id  = req.param("id"),
        type = req.param("type");

    Shape.find(lid, id, type, function(err, json) {
        if (err) res.send(500, err);
        else res.jsonp(json);
    });
};
