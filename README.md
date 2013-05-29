expressSimpleBlog
=================

Simple Blog example with Express, Jade, Mongoose

This example covers following topics;

- `express`
- `mongoose`
- `jade`
- `session`
- `schema decoration`
- `security`
- `routes`
- `ideal project structure`

Quick links ;

[mongoose](https://github.com/LearnBoost/mongoose)
[express](https://github.com/visionmedia/express)
[jade](https://github.com/visionmedia/jade)


## Basic express installation
```javascript
  npm install -g express
  
  express
  
  create : .
     create : ./package.json
     create : ./app.js
     create : ./public
     create : ./public/javascripts
     create : ./public/images
     create : ./public/stylesheets
     create : ./public/stylesheets/style.css
     create : ./routes
     create : ./routes/index.js
     create : ./routes/user.js
     create : ./views
     create : ./views/layout.jade
     create : ./views/index.jade
  
     install dependencies:
       $ cd . && npm install
  
     run the app:
       $ node app
```

## Schema examples
###Single
```javascript
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
```

###Embedded
```javascript
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
```

##Mongoose best practises
###1 Find specific user by username
```javascript
  Model.findOne({username: "johndoe"}, function(err, userName) {
    if (err) {
      next("technical error occured");
    } else {
      if (userInfo) {
        next("User details : " + userInfo);
      } else {
        next("User not found")
      }
    }
  });
```
###2 Find users have age under 18 and sort them desc
```javascript
  var query = Model.find({age: {$lt: 18}}).sort({age: -1});
  query.execFind({}, function(err, users) {
    if (err) {
      next("Technical error occured");
    } else {
      if (users) {
        next("How could you registered to my system? You will be banned one by one!!!");
        users.forEach(function(user) {
          user.status = "banned";
          user.save(function(err) {
            if (err) {
              next("Technical error occured while banning user : " + user);
            } else {
              next("Go find another buggy system to yourself!!!");
            }
          });
        })
      } else {
        next("System has no security vulnerability:)")
      }
    }
  });
```
###3 Insert subdocument
```javascript
  Model.findOne({username: "johndoe"}, function(err, userInfo) {
    if (err) {
      next("Technical error occured");
    } else {
      if (userInfo) {
        var SubModel = new SubModel();// Assumed to be initialized somewhere above in the sky
        SubModel.projectName = "SocialAuth";
        SubModel.projectLanguage = "PHP";
        SubModel.projectCost = 100;
        userInfo.projects.push(SubModel);
        userInfo.save(function(err) {
          if (err) {
            next("Technical error again.What a stable system i am");
          } else {
            next("New project experience added to user : " + userInfo.username);
          }
        });
      }
    }    
  });
```
###4 Update subdocument
```javascript
  Model.update(
            {
                username: "johndoe", project.name: "SocialAuth"
            },
            {
                $inc: {'projects.$.cost': 200}
            },
            //In order to update all documents. If you set this false, it will update only first found document
            {multi: true},
            function(err, result) {
              if (err) {
                next("Technical error occured");
              } else {
                next("Project finished its first year so i am updating its price as 200$ :)");
              }
            
            }
```

## MongoDB credentials setup for project
In this project some user authentication methods have been used, so you can seup your mongodb user for your db;
```javascript
  mongo localhost

  use <blog>

  db.addUser("test", "123456")
```

Added user `test` for b `blog`. This will be used in project config

## Nested functions to waterfall
In express applications, there is a view problem on nested functions. Let's eee it in an example;
```javascript
  Model1.findOne({username: "johndoe"}, function(err, userInfo) {
    if (err) {
      ........
    } else {
      Model2.find({age: userInfo.age}, function(err, model2Info) {
        if(err) {
          ......
        } else {
          Model3.find({something: model2Info.count}, function(err, model3Info) {
            if (err) {
              ........
            } else {
              .................
              ............
              ..............
              //4 more nested function
              Model8.find({}, function(err, someInfo) {
                if(err) ............
                else
                  next("I have found the result but i don't want to use this result because of this nasty nested function!!!");
              });
            }
          });
        }
      });
    }
  });
```

In real projects, there are such cases, so our hero on this case is;

[step](https://github.com/creationix/step)
or
[async](https://github.com/caolan/async)

I prefer async, because i used them and async wins :) async also has 3466 stars but step has 1091. 
There are several ways to re-implement above nested function by using async. We can use waterfall model(For more info please refer to project github documentation)

```javascript
  async.waterfall([
    function(callback) {
      Model1.findOne({username: "johndoe"}, function(err, userInfo) {
        callback(null, userInfo);
      });    
    },
    function(userInfo, callback) {
      Model2.find({age: userInfo.age}, function(err, model2Info) {
        callback(null, model2Info);
      
      });
    },
    function(model2Info, callback) {
      Model3.find({something: model2Info.count}, function(err, model3Info) {
        var dummy = 15;
        callback(null, model3Info, dummy);
      });
      
    },
    function(modelInfo, count, callback) {
      var some = foo(modelInfo, count);
      callback(null, some);
    },
    ..........................
    ......................
    ,
    function(modelInfo, callback) {
      callback(null, modelInfo);  
    }
    ], function(err, result) {
      if (err) .......
      else
        next("Result found and i am happy to use this result");
    });
```

