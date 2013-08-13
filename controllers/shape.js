var Shape = require('../models/Shape');

// GET /layer/:lid/s/:id
exports.index = function(req, res) {
    var lid = req.param("lid"),
        id  = req.param("id");

    /* Shape.find(lid, id, function() {
        if (err) res.send(500, err);
    });*/
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
