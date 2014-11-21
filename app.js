var express = require('express'),
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    debug = require('debug')('atlastory-api'),
    swig = require('swig'),
    gcj = require('grand-central-junction'),
    app = express();

app.enable("jsonp callback");

app.set('port', process.env.PORT || 3000);

swig.setDefaults({ cache: false });
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

var assets = path.join(__dirname, 'assets');

app.use(require('less-middleware')(assets));
app.use(express.static(assets));

gcj.route(app);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var msg = req.path ? "Path '"+ req.path +"' Not Found" : 'Not Found';
    var err = new Error(msg);
    //if (/\.html$/.test(req.path) || req.accepts('html')) err.format = 'html';
    err.status = 404;
    next(err);
});

/// error handler

app.use(function(err, req, res, next) {
    var error = {
        error: true,
        code: err.status || err.code || 500,
        message: err.message,
        stack: err.stack
    };
    if (process.env.ENV === 'production') delete error.stack;
    res.status(error.code);

    if (/\.html$/.test(req.path) || (req.accepts('html') && !req.accepts('json'))) {
        res.render('error', {
            message: err.message,
            error: error
        });
    } else {
        if (error.stack && typeof err.stack == 'string')
            error.stack = err.stack.split('\n    ');
        res.jsonp(error);
    }
});

/// serve

function start() {
    var port = app.get('port');
    var server = app.listen(port, function() {
        debug('Express server listening on port ' + server.address().port);
        console.log("Server pid %s listening on port %s in %s mode",
            process.pid,
            port,
            process.env.ENV
        );
    });
}

if (require.main === module) start();

module.exports = app;
