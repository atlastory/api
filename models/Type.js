var db = require('../services/db'),
    util = require('../lib/utilities');


var Type = module.exports = db.pg.model("types", {
    schema: {
        name: {
            type: String, // TODO: only allow abc, 123, -
            length: 50,
            allowNull: false
        },
        level_id: { type: Number, allowNull: false },
        color_1: { type: String, length: 255, default: '' },
        color_2: { type: String, length: 255, default: '' },
        created_at: Date,
        updated_at: Date
    }
});

// Get types given a type or level name
Type.addQueryMethod('getFromTypeOrLevel', function(name) {
    return db.pg.queue()
    .add("SELECT types.id, levels.name AS level, types.name " +
        "FROM levels JOIN types ON types.level_id = levels.id " +
        "WHERE levels.name = :name OR types.name = :name", { name: name });
});
