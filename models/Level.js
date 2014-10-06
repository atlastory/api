var db = require('../services/db'),
    util = require('../lib/utilities');


var Level = module.exports = db.pg.model("levels", {
    schema: {
        name: {
            type: String, // TODO: only allow abc, 123, -
            length: 25,
            allowNull: false
        },
        level: { type: Number, allowNull: false, default: 0 },
        created_at: Date,
        updated_at: Date
    },
    methods: {
        types: function() {
            return Level.Type.where({ level_id: this.id })
                .select(['id','name','color_1','color_2']).run();
        }
    }
});

var Type = Level.Type = require('./Type');
