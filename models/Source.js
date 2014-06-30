var db = require('../db/db'),
    util = require('../lib/utilities');


var Source = module.exports = db.pg.model("sources", {
    schema: {
        name: String,
        source: String,
        created_at: Date,
        updated_at: Date
    }
});
