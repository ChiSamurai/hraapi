var url = require('url');
var express = require('express');
var usersRouter = express.Router();

var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config'); // get config file
var token = require('../token');

var Users = require('../models/Users.js');
var Groups = require('../models/Groups.js');
var Permissions = require('../models/Permissions.js');
var bodyParser = require('body-parser');
/*var LDAP = require('ldap-client');*/

var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

function fullUrl(req) {
  return url.format({
    protocol: req.protocol,
    hostname: req.hostname,
    port: req.app.settings.port,
    pathname: req.originalUrl
  });
};

function createToken(user){
  var tokenData = {
    username: user.username
  };
  var token = jwt.sign(tokenData, config.secret, {
    expiresIn: "24h" // expires in 24 hours
  });
  // store cookie
  let options = {
      maxAge: 1000 * 60 * 60 * 24, // would expire after 24h
/*        maxAge: 0, // would expire after 24h*/
      httpOnly: true, // The cookie only accessible by the web server
      signed: true // Indicates if the cookie should be signed
  }
  return token;
};


usersRouter.get('/logout', function(req, res) {
  res.clearCookie('x-access-token');
  res.send("logged out");
});

usersRouter.post('/login', function(req, res, next) {
  //check if it's a non-local username
  var usernameParsed = req.body.username.split("@");
  //redirect route to different strategies
  if(usernameParsed[2] != 'undefined'){
    req.url = "/users/authenticate/local";
    /*return passport.authenticate('local', {session:false})(req, res, next);*/
    return passport.authenticate('local', {session:false}, function(err, user, info) {
      if (err) { return next(err); }
      if (!user) {
        res.status(403);
        res.send("invalid username or password");
        return;
      }
      res.status(200);
      var token = createToken(user);
      let options = {
        maxAge: 1000 * 60 * 60 * 24, // would expire after 24h
/*        maxAge: 0, // would expire after 24h*/
        httpOnly: true, // The cookie only accessible by the web server
        signed: true // Indicates if the cookie should be signed
      };
      res.cookie('x-access-token', token, options)
      res.send({
        token: token,
        username: user.username,
        forename: user.forename,
        lastname: user.lastname,
        email: user.email,
        message: "Welcome back " + user.forename + " " + user.lastname
      });
/*    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/users/' + user.username);
    });*/
  })(req, res, next);
  }else{
    //ToDo: Implement other logins/authentication methods like LDAP
    res.send("RemoteLogin");
  }
});

usersRouter.post('/authenticate', passport.authenticate('ldapauth', {session: false}), function(req, res) {
  //user Metadata (LDAP)
  var userMetadata = {
    username: req.user.sAMAccountName + "@" + config.ldapIdSuffix,
    fullName: req.user.name,
    displayName: req.user.displayName,
    email: req.user.mail,
    groups: {
      ldap: req.user.memberOf,
      local: []
    }
  };
  req.userMetadata = userMetadata;
  // get local groups
  Groups.getUserGroups(req, res, function(err, req, res, next) {
    if (err) return next(err);
    req.userMetadata.admin = false;  
    req.userMetadata.groups.local.forEach(function(group) {
      if(group.id === "admins"){
        req.userMetadata.admin = true;
      }
    });
    // create a token
    var token = jwt.sign(userMetadata, config.secret, {
      expiresIn: "24h" // expires in 24 hours
    });
    // store cookie
    let options = {

        maxAge: 1000 * 60 * 60 * 24, // would expire after 24h
/*        maxAge: 0, // would expire after 24h*/
        httpOnly: true, // The cookie only accessible by the web server
        signed: true // Indicates if the cookie should be signed
    }
    
    res.cookie('x-access-token', token, options)
    res.json({
      /*metadata: userMetadata,*/
      message: "Welcome back, " + userMetadata.fullName,
      token: token
    });
  });
});

usersRouter.get('/checkLogin', function(req, res, next) {
  if(typeof(req.userMetadata) !== "undefined" && req.userMetadata.username !== "guest"){
    res.json({
      "result": true,
      "message": "Welcome back, " + req.userMetadata.fullName
    });
  }else{
    res.send({
      "result": false
    });
  }
});

usersRouter.post('/verifyToken', function(req, res, next) {
  if(typeof(req.userMetadata) !== "undefined"){
    res.json({userMetadata: req.userMetadata});
  }else{
    res.status(401);
    res.send("Token/User not accepted!");
  }
});

usersRouter.get('/permissionsFor/:entityid', function(req, res, next) {
  Permissions.getUserPermissionsForId(req, req.params.entityid, function(err, post) {
    if (err) return next(err);
    res.json(post);
  }); 
});

usersRouter.get('/localGroups', function(req, res, next) {
  res.send(req.userMetadata.groups.local);
});

/*urlencodedParser*/
usersRouter.post('/admin/generateStandardPermissionsFor', Users.checkAdmin, function(req, res, next) {
  res.send("ADMIN!");
/*  Permissions.createEntityPermissions(req, req.body.entityId, entityType, function(err, post) {
    console.log(req.body.entityId);
    if (err) return next(err);
    res.status(200);
    res.send(true);
  });  */
});

usersRouter.post('/admin/setUserPermissions', Users.checkAdmin, urlencodedParser, function(req, res, next) {
  Permissions.setUserPermissions(req.body.entityId, req.body.username, req.body.permissions, function (err, post) {
    if (err) return next(err);
    //if false there is no permission entry for this entity yet
    if (post === false){
      res.status(404);
      res.send("no permission entry for this entity yet.");
      return;
    }
    else res.json(post);
  });
});


/*usersRouter.post('/searchUser', token.check, Users.checkadmin, function(req, res, next) {
  if (err) return next(err);
  var ldapOptions = {
    uri: config.ldapStrategyOpts.server.url,
    base: config.ldapStrategyOpts.server.searchBase,
    attrs: '*'    
  };
  var ldap = new LDAP(options, function(err) {
    if (err) return next(err);
  });
});*/

module.exports = usersRouter;