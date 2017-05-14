var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var uuid = require('uuid/v4');
var Groups = require('../models/Groups.js');
var jsonQuery = require('json-query');
var Schema = mongoose.Schema;
/**
 * Mongoose Schema for Users
 *
 * @module UserSchema
 */
var UserSchema = new Schema({
	/*"userId": {type:String, required:true, unique:true, dropDups: true, default: uuid},*/
  "source": {type:String, required:true, unique:false, default: "local"}, //local or ldap? (or anything else in the future)
  "username": {type:String, required:true, unique: true},
	"forename": {type:String, required:false},
	"lastname": {type:String, required:false},
  "password": { type: String, required: true }, //this is ignored if user.source is not "local"
	"email": {type:String, required:true},
  "active": {type:Boolean, required:true, default: true}
  },{
    timestamps: true
  }
);

UserSchema.pre('save', function(next) {
    var user = this;
    // only hash the password if it has been modified (or is new)
    if (user.source !== "local" || !user.isModified('password')) return next();
    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password along with our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});


/**
 * Compare the submitted password with the encrypted representation stored in DB
 *
 * @memberof module:UserSchema
 * @param  {string}   candidatePassword the password to check
 */
UserSchema.methods.comparePassword = function(candidatePassword, next) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) return next(err);
      return next(null, isMatch);
  });
};

/**
 * Check if authenticated user is admin
 * adds {bool} parameter req.userMetadata.admin
 *
 * @memberof module:UserSchema
 *
 */
UserSchema.statics.checkAdmin = function(req, res, next) {
  if(req.userMetadata.groups.indexOf('admins') !== -1) return next();
  res.status(403);
  res.send("admins only!");
};

/**
 * MW: Check if an admin exists in system
 * adds {bool} parameter req.adminExists
 
 * @memberOf module:UserSchema
 */
UserSchema.statics.adminExists = function(req, res, next) {
  Groups.getGroupMembers(['admins'], true, function (err, foundUsers) {
    if(err) return next(err);
    req.adminExists = (foundUsers['admins'] === undefined || foundUsers['admins'].length === 0)?false:true;
    return next();
  });
};


/**
 * get user Objects by usernames
 *
 * @memberof module:UserSchema
 * @param  {Array}   usernames  the usernames to search, eg ['admin', 'someStandardUser']
 * @param  {bool}    onlyActive if false also inactive users will get returned
 *
 * @return {Array}              Array with found user objects
 */
UserSchema.statics.getUsers = function(usernames, onlyActive, next) {
  var query = {"username": { $in: usernames}};
  if (onlyActive)
    query = {$and: [query, {"active": true}]}; 
  
  mongoose.model('Users').find(query, {password: 0}, function (err, foundUsers){
    if(err) return next(err);
    next(null, foundUsers);
  });
};

/**
 * passport.js Function for authenticating a local user
 * @memberof module:UserSchema
 * @param  {string}  username the username which tries to authenticate
 * @param  {string}  password the candid password in plaintext
 */
UserSchema.statics.authLocal = function(username, password, next) {
  mongoose.model('Users').findOne({username:username, active:true}, function (err, user) {
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
};

/*

UserSchema.statics.getUsersById = function(userIds, onlyActive, next) {
  var query = {"userId": { $in: userIds}};
  if (onlyActive)
    query = {$and: [query, {"active": true}]}; 
  
  mongoose.model("Users").find(query, {password: 0}, function (err, foundUsers){
    if(err) return next(err);
    next(null, foundUsers);
  });
};
*/
module.exports = mongoose.model('Users', UserSchema)