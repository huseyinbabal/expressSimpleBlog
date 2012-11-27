module.exports = function (mongoose) {
    var validator = require('../lib/validator'),
            Schema = mongoose.Schema,
            util = require('util'),
            config = require('config'),
            Blog, Comment;

    Comment = new Schema({
        text:{
            type:String,
            required:true
        },
        author:{
            type:String,
            validate:[validator({
                length:{
                    min:3,
                    max:20
                }
            }), "username"],
            required:false,
            default:"anonymous"
        },
        createDate:{
            type:String,
            required:false,
            default: Date.now
        }
    });

    Blog = new Schema({
        title:{
            type:String,
            required:true
        },
        text:{
            type:String,
            required:true
        },
        author:{
            type:String,
            validate:[validator({
                length:{
                    min:3,
                    max:20
                }
            }), "username"],
            required:false,
            default:"anonymous"
        },
        comments: {type: [Comment]},
        createDate:{
            type:Date,
            required:false,
            default: Date.now
        }
    });

    Blog.statics.postComment = function(blogID, text, author, cb) {
        var BlogModel = mongoose.model('Blog');
        var CommentModel = mongoose.model('Comment');

        var commentModel = new Comment();
        commentModel.author = author;
        commentModel.text = text;

        BlogModel.findOne({_id: blogID}, function(err, blogInfo) {
            if (err) {
                cb({
                    retStatus: "failure",
                    message: "Blog commenting failed : " + util.inspect(err)
                });
            } else {
                if (blogInfo) {
                    blogInfo.comments.push(commentModel);
                    blogInfo.save(function(err) {});
                    cb({
                        retStatus: "success",
                        message: "Comment saved"
                    });
                } else {
                    cb({
                        retStatus: "failure",
                        message: "Blog not found"
                    });
                }
            }
        });
    }

    var Comment = mongoose.model('Comment', Comment);
    return mongoose.model('Blog', Blog);
}

