var Shape = require('../models/Shape');

// GET /layer/:lid/s/:id
exports.show = function(req, res) {
    var lid = req.param("lid"),
        id  = req.param("id");

    Shape.find(lid, id, function(err, json) {
        if (err) res.send(500, err);
        res.type('application/json');
        res.send(JSON.stringify(json));
    });
};

// POST /layer/:lid/s/:id
// wiki model
// exports.create

// PUT /layer/:lid/s/:id
// wiki model
// exports.update

// DELETE /layer/:lid/s/:id
// wiki model
// exports.destroy
