var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var bcrypt = require('bcryptjs');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
/* ROUTES */
var index = require('./routes/index');
var users = require('./routes/users');
var questions = require('./routes/questions');
var answers = require('./routes/answers');
/* MODELS */
var User = require('./models/user');
var app = express();
//mongoose.connect('mongodb://localhost:27017/ask')
mongoose.connect('mongodb://owner:owner@ds127321.mlab.com:27321/heroku_mcm8pndf')
.then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
/* config */
app.set('superSecret', 'thisllookslikesecretright');
app.use('/', index);
app.use('/users', users);
app.use('/questions', questions);
app.use('/answers', answers);
app.get('/gettoken',csrfProtection, function(req,res) {
  var token = req.csrfToken();
  res.json({token: token});
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
