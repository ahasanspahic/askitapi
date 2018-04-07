var express = require('express');
var router = express.Router();
var Question = require('../models/question');
var User = require('../models/user');
var jwt    = require('jsonwebtoken'); 
var superSecret = 'thisllookslikesecretright';

// middleware to use for all requests
router.use(function(req, res, next) {
  // do logging
  console.log('Something is happening.');
  //console.log(req.body);
  var token = req.get('Authorization');
  //console.log(token);
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
  /* In production must be pointing only to the WEB project URL */
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === 'OPTIONS' ) {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  }
  next(); // make sure we go to the next routes and don't stop here
});
/* GET question listing. */
router.get('/:page/:pageSize', function(req, res, next) {
  var page = 0;
  var pageSize = 20;
  if(!isNaN(req.params.page)) 
    page=parseInt(req.params.page);
  if(!isNaN(req.params.pageSize)) 
    pageSize=parseInt(req.params.pageSize);
  Question.find().limit(pageSize).skip(page*pageSize).sort({dateTime: 'desc'})
    .exec(function(err, questions) {
    if (err)
        res.status(400).send(err);  
    res.json(questions);
  });
});
/* GET question  */
router.get('/:id', function(req, res, next) {
  Question.findById(req.params.id)
    .exec(function(err, question) {
    if (err)
        res.status(400).send(err);
    else if(question == null)
      res.status(404).send();
    else
      res.json(question);
  });
});
/* GET popular question listing. */
router.get('/popular/:page/:pageSize', function(req, res, next) {
  var page = 0;
  var pageSize = 20;
  if(!isNaN(req.params.page)) 
    page=parseInt(req.params.page);
  if(!isNaN(req.params.pageSize)) 
    pageSize=parseInt(req.params.pageSize);
  Question.find().where('likeCount').gt(0)
    .limit(pageSize).skip(page*pageSize).sort({likeCount: 'desc'})
    .exec(function(err, questions) {
    if (err)
        res.status(400).send(err);  
    res.json(questions);
  });
});
/* GET my question listing. */
router.get('/myquestions/:page/:pageSize', function(req, res, next) {  
  var islogged = req.body.islogged; 
  console.log("Is user logged:" + req.body.islogged);
  if(!islogged) {
    return res.status(400).json({ message: 'Must be logged in!' });
  }
  else {
    var page = 0;
    var pageSize = 20;
    if(!isNaN(req.params.page)) 
      page=parseInt(req.params.page);
    if(!isNaN(req.params.pageSize)) 
      pageSize=parseInt(req.params.pageSize);
    var decoded = req.decoded;
    Question.find().where('userId').equals(decoded.userId)
    .limit(pageSize).skip(page*pageSize).sort({dateTime: 'desc'})
      .exec(function(err, questions) {
      if (err)
          res.status(400).send(err);
      else  
        res.json(questions);
    });
  }
});
/* POST create question */
router.post('/', function(req, res, next) {
    // if everything is good, save to request for use in other routes
    var islogged = req.body.islogged; 
    console.log(req.body.islogged);
    if(!islogged) {
      return res.status(401).json({ message: 'Must be logged in!' });
    } 
    else 
    {
      var decoded = req.decoded; 
      var question = new Question();
      question.headline = req.body.headline;
      question.text = req.body.text;
      question.userId = decoded.userId;
      question.username = decoded.user;
      question.save(function(err) {
      if (err) {
          var message = [];
          console.log(err);
          if(err.errors.headline != undefined)
            message.push(err.errors.headline.message);
          if(err.errors.text != undefined)
            message.push(err.errors.text.message);
          if(err.errors.userId != undefined)
            message.push(err.errors.userId.message);
          if(err.errors.username != undefined)
            message.push(err.errors.username.message);
          console.log(message);
          res.status(400).send({message: message});
      }
      else
          res.json({ message: 'Question created!' });
      });  
    }
});
  // LIKE question
router.put('/like/:question_id', function(req, res, next) {
    // if everything is good, save to request for use in other routes
    var islogged = req.body.islogged; 
    console.log(req.body.islogged);
    if(!islogged) {
      return res.status(401).json({ message: 'Must be logged in!' });
    } 
    else {
      var decoded = req.decoded; 
      //console.log(decoded);
      Question.findById(req.params.question_id, function(err, question) {
        //console.log(question);
        var newChanges = false;
        if(err) {
          console.log(err);
          res.status(400).json({ message: 'Update failed!' });
        }
        console.log(req.body);
        if(req.body.like == true)
        {
          var userLiked = question.likes.filter(like => (like.body === decoded.userId));
          var userDisliked = question.dislikes.filter(dislike => (dislike.body === decoded.userId));
          if(userLiked[0] != undefined) 
            res.status(304).json({ message: 'User already liked this comment!' });
          else if(userDisliked[0] != undefined)
            res.status(304).json({ message: 'User already disliked this comment!' });
          else {
            var now = Date.now.toString();
            var like = new Object();
            like.body = decoded.userId;
            like.date = Date.now();
            question.likes.push(like);
            question.likeCount = question.likes.length;
            newChanges = true;
          }
        }
        else {
          var userLiked = question.likes.filter(like => (like.body === decoded.userId));
          var userDisliked = question.dislikes.filter(dislike => (dislike.body === decoded.userId));
          if(userLiked[0] != undefined) 
            res.status(304).json({ message: 'User already liked this comment!' });
          else if(userDisliked[0] != undefined)
            res.status(304).json({ message: 'User already disliked this comment!' });
          else {
            question.dislikes.push({body: decoded.userId, date: Date.now()});
            question.dislikeCount = question.dislikes.length;
            newChanges = true;   
          }     
        } 
        if(newChanges) {
          question.save(function(err) {
            if(err)
              res.status(400).json({ message: 'Update failed!' });
            else
              res.json({ message: 'Update ok!' });
          });   
        }   
      });
    }     
  });

  // ANSWER question
  router.put('/answer/:question_id', function(req, res, next) {
    // if everything is good, save to request for use in other routes
    var islogged = req.body.islogged; 
    console.log(req.body.islogged);
    if(!islogged) {
      return res.status(401).json({ message: 'Must be logged in!' });
    } 
    else {
      var decoded = req.decoded; 
      //console.log(decoded);
      Question.findById(req.params.question_id, function(err, question) {
        //console.log(question);
        var newChanges = false;
        if(err) {
          console.log(err);
          res.status(400).json({ message: 'Update failed!' });
        }
        //console.log(req.body);
        if(req.body.answer == undefined || req.body.answer.trim() == '')
        {
          res.status(400).json({ message: 'Empty comment.' });
        }
        else {
          question.answers.push({text : req.body.answer, username: decoded.user, userId : decoded.userId, likes: [], dislikes: []});
          newChanges = true;     
        } 
        if(newChanges) {
          question.save(function(err) {
            if(err) /* Update to question failed, do not increace answer count for user */
              res.status(400).json({ message: 'Update failed!' });
            else { /* Update to question successeded, increace answer count for user */
              User.findById(decoded.userId, function(err, user) 
              {
                if(err) {
                  console.log(err);
                  res.status(400).json({ message: 'Update failed!'});
                }
                user.answerCount = user.answerCount + 1;
                user.save(function(err) {
                  if(err) {
                    console.log(err);
                    res.status(400).json({ message: 'Update failed!'});
                  }
                  else {
                    res.json({ message: 'Update ok!'});
                  }
                });
              });
            }
          });   
        }   
      });
    }     
  });
  // Like answer
  router.put('/answer/like/:answer_id/:question_id', function(req, res, next) {
    // if everything is good, save to request for use in other routes
    var islogged = req.body.islogged; 
    //console.log(req.body.islogged);
    if(!islogged) {
      return res.status(401).json({ message: 'Must be logged in!' });
    } 
    else {
      var decoded = req.decoded; 
      //console.log(decoded);
      Question.findById(req.params.question_id,function(err, question) {
        var answers = question.answers.filter(a => (a._id == req.params.answer_id));
        var answer = answers[0];
        var newChanges = false;
        if(req.body.like == true)
        {
          var userLiked = answer.likes.filter(like => (like.userId === decoded.userId));
          var userDisliked = answer.dislikes.filter(dislike => (dislike.userId === decoded.userId));
          if(userLiked[0] != undefined) 
            res.status(304).json({ message: 'User already liked this comment!' });
          else if(userDisliked[0] != undefined)
            res.status(304).json({ message: 'User already disliked this comment!' });
          else {
            answer.likes.push({userId: decoded.userId});
            answer.likeCount = answer.likes.length;
            newChanges = true;
          }
        }
        else {
          var userLiked = answer.likes.filter(like => (like.userId === decoded.userId));
          var userDisliked = answer.dislikes.filter(dislike => (dislike.userId === decoded.userId));
          if(userLiked[0] != undefined) 
            res.status(304).json({ message: 'User already liked this comment!' });
          else if(userDisliked[0] != undefined)
            res.status(304).json({ message: 'User already disliked this comment!' });
          else {
            answer.dislikes.push({userId: decoded.userId});
            answer.dislikeCount = answer.dislikes.length;
            newChanges = true;   
          }     
        } 
        if(newChanges) {
          question.save(function(err) {
            if(err)
              res.status(400).json({ message: 'Update failed!' });
            else
              res.json({ message: 'Update ok!' });
          });   
        } 
      });
    }     
  });
module.exports = router;