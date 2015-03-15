var md = require('../lib/markdown');
var err = require('../lib/errors');

exports.index = function(req, res) {
    res.redirect('/docs');

    // Direct Markdown rendering
    /*md('docs/README').then(function(html) {
        res.render('index', {
            title: "Atlastory API",
            content: html
        });
    })
    .fail(err.send(res, 304, "rendering markdown"));*/
};
