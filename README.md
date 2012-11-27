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
            }, function(err, result) {
              if (err) {
                next("Technical error occured");
              } else {
                next("Project finished its first year so i am updating its price as 200$ :)");
              }
            
            }
```