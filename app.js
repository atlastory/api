var express = require('express'),
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    debug = require('debug')('my-application'),
    gcj = require('grand-central-junction'),
    app = express();

app.enable("jsonp callback");

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handler

app.use(function(err, req, res, next) {
    var error = (app.get('env') === 'development') ? err : {};
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
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
