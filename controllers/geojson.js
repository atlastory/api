var Layer = require('../models/Layer');


exports.get = function(req, res) {
    var id = req.params("id"),
        pid = req.params("pid");
    Layer.getGeoJSON(id, pid, function(err, geojson) {});
};
