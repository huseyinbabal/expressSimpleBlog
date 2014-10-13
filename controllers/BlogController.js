var util = require('util');
var Logger = require('devnull');
var logger = new Logger({namespacing : 0});
var Blog = require('../models/Blog');

BlogController = function (app, mongoose, config) {
    var Blog = mongoose.model('Blog');

    /**
     * List recent blog posts
     */
    app.get('/blog/list/?', function(req, res, next) {
        util.log(req.method + " request to url : " + req.route.path);
        var query = Blog.find({}).sort({'createDate': -1});
        query.execFind(function(err, blogPosts) {
            if (!err) {
                res.render('blog-list', {
                    title: "Recent blog posts",
                    blogPosts: blogPosts
                });
            } else {
                res.status(500);
                res.render('500', {
                    err: err,
                    url: req.url
                });
            }
        });
    });

    app.get('/blog/new/?', function(req, res, next) {
        util.log(req.method + " request to url : " + req.route.path);
        res.render('blog-new', {
            title: "Create new blog post",
            error: false
        });
    });



    function slugify(text) {
        return text.toString().toLowerCase()
          .replace(/\s+/g, '-')        // Replace spaces with -
          .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
          .replace(/\-\-+/g, '-')      // Replace multiple - with single -
          .replace(/^-+/, '')          // Trim - from start of text
          .replace(/-+$/, '');         // Trim - from end of text
    }    

    /**
     *
     */
    app.post('/blog/create/?', function(req, res, next) {
        util.log(req.method + " request to url : " + req.route.path);
        var title = req.body.title;
        var text = req.body.text;
        var blogModel = new Blog();
        blogModel.title = title;
        blogModel.text = text;
        blogModel.author = req.session.user.username;
        blogModel.pre('save', function (next) {
            this.slug = slugify(this.title);
            next(); 
        });
        blogModel.save(function(err) {
            if (err) {
                res.status(500);
                res.render('blog-new', {
                    title: "Create new blog post",
                    error: "Blog creation failed : " + util.inspect(err)
                });
            } else {
                res.redirect('/blog/list/');
            }
        });
    });

    app.get('/blog/:blogID/?', function(req, res, next) {
        util.log(req.method + " request to url : " + req.route.path);
        var slug = req.params.slug;
        
        Blog.findOne({slug: slug}, function(err, blogInfo) {
            if (blogInfo) {
                res.render('blog-detail', {
                    title: blogInfo.title,
                    blogInfo: blogInfo
                });
            } else {
                res.status(404);
                res.render('404', {
                    title: "Blogpost not fount",
                    err: "Blog post not found",
                    err: req.url
                })
            }
        });
    });

    app.post('/blog/comment/?', function(req, res, next) {
        util.log(req.method + " request to url : " + req.route.path);
        var text = req.body.text;
        var blogID = req.body.blogID;
        Blog.postComment(blogID, text, req.session.user.username, function(data) {
            if (data.retStatus == "failure") {
                res.render('blog-detail', {
                    title: "Comment post error",
                    error: data.message
                })
            } else {
                res.redirect('/blog/' + blogID + '/view/');
            }
        });
    });
}

module.exports = BlogController;
