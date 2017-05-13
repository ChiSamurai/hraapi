/**
* @file The main file
* @email: samurai@gono.info
* @Author: Matthias Guth
* @Date:   2017-04-22 16:00:59
* @Last Modified by:   Matthias Guth
* @Last Modified time: 2017-05-13 19:04:19
*/
// load mongoose package
var mongoose = require('mongoose');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('express-cors')
var morgan = require('morgan');
var config = require('./config'); // get the config file
var url = require('url');
var util = require('util');

var index = require('./routes/index');

var passport = require('passport');
var LdapStrategy = require('passport-ldapauth');
var LocalStrategy = require('passport-local').Strategy;


var install = require('./routes/install');
var admin = require('./routes/admin');
var users = require('./routes/users');
var groups = require('./routes/groups');
var annotations = require('./routes/annotations');
var manifests = require('./routes/manifests');
var tests = require('./routes/tests');
var doc = require('./routes/doc');

var Users = require('./models/Users.js');


// connect to MongoDB
var connectString = 'mongodb://';
if (config.database.user){
  connectString += config.database.user + ":" + config.database.password + "@";
}
connectString += config.database.uri + ":" + config.database.port + "/" + config.database.database;
mongoose.connect(connectString);
passport.use(new LdapStrategy(config.ldapStrategyOpts));
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  
  /*Users.authLocal*/
  function(username, password, next) {
    Users.findOne({username:username, active:true}, function (err, user) {
      if(err) return next(err);
      // Compare the submitted password with the one stored
      user.comparePassword(password, function(err, matches) {
        if(matches){
          return next(null, user);
        }else{
          return next(null, false, {message: 'Incorrect username.'});
        }
      })
    });
  })
);

var app = express();

app.set('superSecret', config.secret); // secret variable
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
/*app.use(logger('dev'));*/
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.secret));
app.use(express.static(path.join(__dirname, 'public')));

/*app.use('js', express.static(path.join(__dirname, 'public/javascripts')));
app.use('css', express.static(path.join(__dirname ,'public/stylesheets')));
*/
app.use(passport.initialize());

app.use(function(req, res, next) {
  if(config.corsAllowedHosts.indexOf(req.headers.origin) !== -1) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'user-agent, Content-Type, Authorization, Content-Length, X-Requested-With, x-access-token');
  }
  next();
});



app.use('/install', install);
app.use('/admin', admin);
app.use('/users', users);
app.use('/groups', groups);
app.use('/annotations', annotations);
app.use('/manifests', manifests);
app.use('/tests', tests);
app.use('/doc', doc);
app.use('*', index);


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

console.log("running in '" + process.env.NODE_ENV + "' mode");

module.exports = app;
