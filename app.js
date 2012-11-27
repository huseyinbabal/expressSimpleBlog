/**
 * Module dependencies.
 */

// Module initializations
var express = require('express')
    , http = require('http')
    , path = require('path')
    , mongoose = require('mongoose')
    , mongoStore = require('connect-mongo')(express)
    , config = require('config')
    , utils = require('./lib/utils')
    , ENV = process.env.NODE_ENV || 'development';

var app = express();

//connection url for future use
mongoose = utils.connectToDatabase(mongoose, config.db);

// Application setups
app.configure('all', function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', { layout: true });
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.cookieParser());
    app.use(express.session({
        secret: "golb",
        cookie: { maxAge: 24 * 60 * 60 * 1000 },
        store: new mongoStore({
            url: utils.dbConnectionUrl(config.db)
        })
    }));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.csrf());
    app.use(function(req, res, next) {
        res.locals.token = req.session._csrf;
        next();
    });
    app.use(function(req, res, next) {
        res.locals.session = req.session;
        next();
    });
});

// Error handling setup
app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});


// Register models
require('./models/Blog')(mongoose);
require('./models/User')(mongoose);

// Register Controllers
['Blog', 'Site', 'User'].forEach(function (controller) {
    require('./controllers/' + controller + 'Controller')(app, mongoose, config);
});

process.on('uncaughtException', function(err) {
    console.log(err);
});

// Create server and listen application port specified above
http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
