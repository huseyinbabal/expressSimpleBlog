module.exports = function (mongoose) {
    var validator = require('../lib/validator'),
            Schema = mongoose.Schema,
            util = require('util'),
            config = require('config'),
            User;

    User = new Schema({
        name:{
            type:String,
            required:false,
            default: ""
        },
        username:{
            type:String,
            validate:[validator({
                length:{
                    min:3,
                    max:20
                }
            }), "username"],
            required:false,
            default: "defaultusername"
        },
        password:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        registerDate:{
            type:Date,
            required:true,
            default: Date.now
        },
        loginDate:{
            type:Date,
            required:false
        }
    });
    return mongoose.model('User', User);
}