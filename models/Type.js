var db = require('../db/db'),
    util = require('../lib/utilities');


var Type = module.exports = db.pg.model("types", {
    map: true,
    schema: {
        name: { type: String, allowNull: false },
        short_name: { type: String, allowNull: false },
        level: Number,
        color1: { type: String, default: '' },
        color2: { type: String, default: '' },
        changeset_id: Number,
        created_at: Date,
        updated_at: Date
    },
    getters: {}
});
