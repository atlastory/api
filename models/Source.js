var db = require('../db/db'),
    util = require('../lib/utilities');


var Source = module.exports = db.pg.model("sources", {
    schema: {
        name: { type: String, length: 1024, allowNull: false },
        source: { type: String, length: 1024 },
        created_at: Date,
        updated_at: Date
    }
});
