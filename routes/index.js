var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/latestQuestions', function(req,res, next) {
  res.json("aaa");
});
router.get('/mvpList', function(req,res, next) {
  res.json("aaa");
});
router.get('/popularQuestions', function(req,res, next) {
  res.json("aaa");
});
module.exports = router;
