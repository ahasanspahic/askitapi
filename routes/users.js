var express = require('express');
var jwt    = require('jsonwebtoken'); 
var csrf = require('csurf');
var router = express.Router();
var User = require('../models/user');
var superSecret = 'thisllookslikesecretright';
// middleware to use for all requests
router.use(function(req, res, next) {
  // do logging
  console.log('Something is happening.');
  console.log(req.body);
  var token = req.get('Authorization');
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, superSecret, function(err, decoded) {      
      if (err) {
        req.body.islogged = false;   
      } 
      else 
      {
        req.body.islogged = true;
        req.decoded = decoded;
      }
    });    
  }
  else {
    req.body.islogged = false;
  }
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === 'OPTIONS' || req.method === 'PUT') {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization,csrf-token");
  }
  next(); // make sure we go to the next routes and don't stop here
});
/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find(function(err, users) {
    if (err)
        res.send(err);
    else
      res.json(users);
  });
});
/* POST create user */
router.post('/', function(req, res, next) {
  console.log(req.headers);
  //check if existing username
  User.findOne({ username: req.body.username }, function(err, userExisting) {
    if (err) 
      res.status(400).send(err);
    else {
      if (userExisting != null)
        res.status(403).json({ message: 'Username already in use!' });
      else {
        var user = new User();
        user.username = req.body.username;
        user.password = req.body.password;
        user.save(function(err) {
          if (err) {
            var message = [];
            if(err.errors.username != undefined)
              message.push(err.errors.username.message);
            if(err.errors.password != undefined)
              message.push(err.errors.password.message);
            res.status(400).send({message: message});
          }
          else 
            res.json({ message: 'user created!' });
        });
      }
  }
  });  
});
/* PUT update user */
router.put('/:user_id', function(req, res, next) {
    if (req.body.islogged) {
      var decoded = req.decoded; 
        var user = User.findById(decoded.userId, function(err, user) {
          if(err) {
            console.log(err);
            res.status(400).json({ message: 'Update failed!' });
          }
          if(user == undefined) {
            console.log("User not found!");
            res.status(400).json({ message: 'User not found!' });
          }
          else {
            user.comparePassword(req.body.password, function(err, isMatch) {
              if (err) throw err;
              console.log('Password match:', isMatch);
              if(isMatch) {
                user.password = req.body.newPassword;
                user.save(function(err) {
                  if(err) {
                    var message = [];
                    if(err.errors.username != undefined)
                      message.push(err.errors.username.message);
                    if(err.errors.password != undefined)
                      message.push(err.errors.password.message);
                    res.status(400).json({ message: message });
                  }
                  else
                    res.json({ message: 'Update ok!' });
                });
              }
              else {
                res.status(400).json({ message: 'Update failed!' });
              }
            });
        }
        });
    }
    else {
      return res.status(400).json({ message: 'Not logged in!' });
    }  
});
router.get('/isValid', function(req, res, next) {
  res.json({valid: req.body.islogged});
});
/* GET Fetch user */
router.get('/:user_id', function(req, res, next) {
  var user = User.findById(req.params.user_id, function(err, user) {
    if(err) {
      console.log(err);
      res.json({ message: 'No data!' });
    }
    else
      res.end(JSON.stringify({id: user.id, name : user.username}));
  });
});

/* GET 20 users with most answers */
router.get('/mostActiveUsers/:page/:pageSize', function(req, res, next) {
  var page = 0;
  var pageSize = 20;
  if(!isNaN(req.params.page)) 
    page=parseInt(req.params.page);
  if(!isNaN(req.params.pageSize)) 
    pageSize=parseInt(req.params.pageSize);
  User.find()
  .where("answerCount").gt(0)
  .limit(pageSize).skip(pageSize*page).sort({answerCount: 'desc'})
  .select('userId username answerCount')
  .exec(function(err, users) {
    console.log(users.length);
    if (err)
        res.send(err);
    else
      res.json(users);
  });
});
/* POST Login */
router.post('/login', function(req, res, next) {
  User.findOne({ username: req.body.username }, function(err, user) {
    if (err) throw err;
    // test a matching password
    if(user == undefined){
      res.status(401).json({message: "User not found!"});
    }
    else {
      user.comparePassword(req.body.password, function(err, isMatch) {
          if (err) throw err;
          console.log('Password match:', isMatch);
          if(isMatch) {
            const payload = {
              user: user.username,
              userId: user.id 
            };
            var token = jwt.sign(payload, superSecret, {
              expiresIn : 60*60 // expires in 60 minutes
            });  
            // return the information including token as JSON
            res.json({
              success: true,
              token: token,
              username: user.username,
              userId: user.id
            });
          }
          else
            res.status(400).json({ message: 'Wrong password!' });
      });
    }
  });
});
module.exports = router;
