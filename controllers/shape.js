var Shape = require('../models/Shape');

// GET /layer/:lid/shapes
exports.show = function(req, res) {
    var lid = req.param("lid"),
        pid = req.param("pid");

    // Shape.getData(lid, pid, function(err, json) {});
    res.send("Not implemented yet");
};

// GET /layer/:lid/shapes/:id
exports.show = function(req, res) {
    var lid = req.param("lid"),
        id  = req.param("id");

    Shape.find(lid, id, function(err, json) {
        if (err) res.send(500, err);
        else res.jsonp(json);
    });
};
