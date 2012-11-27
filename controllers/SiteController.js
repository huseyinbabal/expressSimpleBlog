var util = require('util');
var Logger = require('devnull');
var logger = new Logger({namespacing : 0});

SiteController = function (app, mongoose, config) {
    app.get('/?', function(req, res, next) {
        res.render('index', {
            title: "Simple Blog Example With Express, Jade, Mongoose"
        });
    });

    app.get('/404/?', function(req, res, next) {
        next();
    });

    app.get('/403/?', function(req, res, next){
        var err = new Error('not allowed!');
        err.status = 403;
        next(err);
    });

    app.get('/500/?', function(req, res, next) {
        next(new Error('Technical error occured'));
    });
}

module.exports = SiteController;