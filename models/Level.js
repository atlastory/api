var db = require('../services/db'),
    util = require('../lib/utilities');


var Level = module.exports = db.pg.model("levels", {
    schema: {
        name: { type: String, length: 255, allowNull: false },
        level: { type: Number, allowNull: false, default: 0 },
        created_at: Date,
        updated_at: Date
    }
});
