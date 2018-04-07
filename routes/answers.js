var express = require('express');
var router = express.Router();
var Answer = require('../models/answer');

// middleware to use for all requests
router.use(function(req, res, next) {
  // do logging
  console.log('Something is happening.');
  console.log(req.body);
  next(); // make sure we go to the next routes and don't stop here
});
/* GET answers listing. */
router.get('/', function(req, res, next) {
    Answer.find(function(err, answers) {
      if (err)
          res.send(err);  
      res.json(answers);
    });
  });

module.exports = router;