var express = require('express'),
    http = require('http'),
    path = require('path'),
    gcj = require('grand-central-junction'),
    app = express();

app.enable("jsonp callback");

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(require('less-middleware')({ src: __dirname + '/assets' }));
    app.use(express.static(path.join(__dirname, 'assets')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

gcj.route(app);

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

// Expose app
module.exports = app;
