var db = require('../db/db'),
    util = require('../lib/utilities');


var Type = module.exports = db.pg.model("types", {
    schema: {
        name: { type: String, length: 255, allowNull: false },
        level: { type: String, length: 25, allowNull: false },
        color1: { type: String, length: 255, default: '' },
        color2: { type: String, length: 255, default: '' },
        created_at: Date,
        updated_at: Date
    },
    getters: {}
});
