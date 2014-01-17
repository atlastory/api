var postgis = require('../lib/postgis'),
    db = require('../db/db'),
    util = require('../lib/utilities');


var Layer = module.exports = db.mysql.model("layers", {
    map: true,
    schema: {
        map_id: { type: Number, default: 1 },
        name: { type: String, allowNull: false },
        color: String,
        level: Number,
        shape: { type: String, allowNull: false },
        short_name: String,
        created_at: Date,
        updated_at: Date
    },
    getters: {
        table: function() {
            return 'l_' + this.id;
        }
    }
});

Layer._all = Layer.all;
Layer.all = function(mapId, callback) {
    return this.where({map_id: mapId}, callback);
};
