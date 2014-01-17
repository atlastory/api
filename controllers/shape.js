var Shape = require('../models/Shape'),
    util = require('../lib/utilities');


// GET /layers/:lid/periods/:pid/shapes/:id.:type
exports.show = function(req, res) {
    var pid = req.param("pid"),
        id  = req.param("id"),
        type = req.param("type");

    Shape.find(pid, id, type, function(err, json) {
        if (err) res.send(500, err);
        else res.jsonp(json);
    });
};
