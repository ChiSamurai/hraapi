var url = require('url');
var express = require('express');
var groupsRouter = express.Router();

var Users = require('../models/Users.js');
var Groups = require('../models/Groups.js');
var Permissions = require('../models/Permissions.js');
var bodyParser = require('body-parser');
/*var LDAP = require('ldap-client');*/

var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

groupsRouter.get('/logout', function(req, res) {
  res.clearCookie('x-access-token');
  res.send("logged out");
});


groupsRouter.put('/new', Users.checkAdmin, function(req, res, next) {
  req.body.creator = req.userMetadata?req.userMetadata.username:"SYSTEM";
  var newGroup = new Groups(req.body);
  newGroup.save(function(err) {
    // Mongoose dupKey error?
    
    if (err){
/*      if (err.name === 'MongoError' && err.code === 11000) {
        console.log(err.toJSON());
      }else{
*/
        return next(err);
/*      }*/
    }
    else res.send(newGroup);
  });
});

module.exports = groupsRouter;