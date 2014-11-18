var Level = require('../models/Level'),
    err = require('../lib/errors');


// GET /levels
exports.index = function(req, res) {
    Level.all().then(function(levels) {
        if (req.param("format") == 'html') {
            res.render('model/index', {
                title: 'Levels',
                columns: Object.keys(levels[0].toJSON()),
                rows: levels
            });
        } else {
            res.jsonp(levels);
        }
    }).fail(err.send(res));
};

// GET /levels/:id
exports.show = function(req, res) {
    var id = req.param("id"), level;

    var find = isNaN(parseFloat(id)) ?
        Level.where({ name: id }) :
        Level.find(id);

    find.thenOne(function(lvl) {
        if (!lvl) return err.notFound(res)('Level '+id+' not found');
        level = lvl;
        return level.getTypes();
    }).then(function(types) {
        level = level.toJSON();
        level.types = types.map(function(t) { return t.toJSON(); });

        if (req.param("format") == 'html') {
            res.render('model/show', {
                title: 'Levels',
                columns: Object.keys(level),
                item: level
            });
        } else res.jsonp(level);
    }).fail(err.send(res));
};

// GET /levels/:id/types
exports.types = function(req, res) {
    var id = req.param("id");

    var find = isNaN(parseFloat(id)) ?
        Level.where({ name: id }) :
        Level.find(id);

    find.then(function(levels) {
        if (!levels.length) return err.notFound(res)('Level '+id+' not found');
        level = levels[0];
        return Level.Type.where({ level_id: level.id });
    }).then(function(types) {
        res.jsonp(types);
    }).fail(err.send(res));
};

//**********************************************
// TODO: Change to admin only \/

// POST /levels
exports.create = function(req, res) {
    var level = Level.new({
        name: req.param("name"),
        level: req.param("level")
    });

    level.save().then(function(levels) {
        res.jsonp(levels[0]);
    }).fail(err.invalid(res));
};

// PUT /levels/:id
exports.update = function(req, res) {
    var id = parseFloat(req.param("id"));

    if (isNaN(id)) return err.invalid(res)('ID required');

    Level.find(id).then(function(level) {
        level = level[0];
        if (!level) return err.notFound(res)('Level '+id+' not found');

        return level.update({
            name: req.param("name"),
            level: req.param("level")
        }).save().catch(err.invalid(res));
    }).then(function(level) {
        res.jsonp(level);
    }).fail(err.send(res));
};

// DELETE /levels/:id
exports.destroy = function(req, res) {
    var id = parseFloat(req.param("id"));

    if (isNaN(id)) return err.invalid(res)('ID required');

    Level.find(id).then(function(levels) {
        if (!levels[0]) return err.notFound(res)('Level '+id+' not found');
        return levels[0].remove();
    }).then(function(level) {
        res.jsonp(level);
    }).fail(err.send(res));
};
