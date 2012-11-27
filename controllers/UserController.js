var util = require('util');
var Logger = require('devnull');
var logger = new Logger({namespacing : 0});
var User = require('../models/User');
var crypto = require('crypto');

UserController = function (app, mongoose, config) {
    var User = mongoose.model('User');

    app.post('/user/login/?', function(req, res, next) {
        util.log(req.method + " request to url : " + req.route.path);
        var email = req.body.email;
        var password = req.body.password;
        var password = crypto.createHash('md5').update(password).digest("hex");
        User.findOne({email: email, password: password}, function(err, userInfo) {
            if (err) {
                res.status(500);
                res.render('500', {
                    err: err,
                    url: req.url
                });
            } else {
                if (userInfo) {
                    req.session.user = userInfo;
                    res.redirect('/');
                } else {
                    res.render('login', {
                        title: 'Login failed',
                        error: 'Incorrect username/passord'
                    });
                }
            }
        });
    });

    app.post('/user/register/?', function(req, res, next) {
        util.log(req.method + " request to url : " + req.route.path);
        var email = req.body.email;
        var password = req.body.password;
        var username = email.split("@");
        username = username[0];
        var userModel = new User();
        userModel.email = email;
        userModel.password = crypto.createHash('md5').update(password).digest("hex");
        userModel.username = username;
        userModel.save(function(err) {
            if (err) {
                res.json('register', {
                    title: 'Register Failed',
                    error: 'Technical error occured' + util.inspect(err)
                });
            } else {
                res.render('register', {
                    title: 'Register successful',
                    error: false
                });
            }
        });
    });

    app.get('/user/new', function(req, res, next) {
        util.log(req.method + " request to url : " + req.route.path);
        res.render('register', {
            title: "Register",
            error: false
        });
    });

    app.get('/user/logout/?', function(req, res, next) {
        if (req.session) {
            req.session.user = undefined;
            req.session.destroy(function(){});
        }
        res.redirect('/');
    });
}

module.exports = UserController;
