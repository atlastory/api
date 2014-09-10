var db = require('../services/db'),
    util = require('../lib/utilities');


var Type = module.exports = db.pg.model("types", {
    schema: {
        name: { type: String, length: 255, allowNull: false },
        level_id: { type: Number, allowNull: false },
        color_1: { type: String, length: 255, default: '' },
        color_2: { type: String, length: 255, default: '' },
        created_at: Date,
        updated_at: Date
    }
});
