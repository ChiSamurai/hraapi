var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var uuid = require('uuid/v4');
var Groups = require('../models/Groups.js');
var jsonQuery = require('json-query');

var UserSchema = new mongoose.Schema({
	"userId": {type:String, required:true, unique:true, dropDups: true, default: uuid},
  "source": {type:String, required:true, unique:false, default: "local"}, //local or ldap? (or anything else in the future)
  "username": {type:String, required:true, unique: true},
	"forename": {type:String, required:false},
	"lastname": {type:String, required:false},
  "password": { type: String, required: true }, //this is ignored if user.source is not "local"
	"email": {type:String, required:true},
  "active": {type:Boolean, required:true, default: true}
	/*"roles": {type: Array, required:false, default:[]}*/
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

UserSchema.methods.comparePassword = function(candidatePassword, next) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) return next(err);
      next(null, isMatch);
  });
};

UserSchema.statics.checkAdmin = function(req, res, next) {
  if(req.userMetadata.admin) return next();
  res.status(403);
  res.send("admins only!");
};

UserSchema.statics.getUsers = function(usernames, onlyActive, next) {
/*    var thisGroup = this;*/
  var query = null;
  if (onlyActive){
    query = {$and: [{"username": { $in: usernames}}, {"active": true}]}; 
  }else{
    query = {"username": { $in: usernames}}; 
  }

  mongoose.model("Users").find(query, {'_id':0, password: 0}, function (err, foundUsers){
    if(err) return next(err);
    next(null, foundUsers);
  });
};

UserSchema.statics.getAdminUsers = function(req, res, next) {
    // check if admin group exists
  var groupnames = ["admins"];
  Groups.getGroups(groupnames, function(err, foundGroups){
    if (err) return next(err);

    //Admin group not found
    if (foundGroups.length === 0) {
      res.adminUsers = [];
      return next(req, res);
    }
    //Admin group exists, so get the members
    adminUsers = jsonQuery('members.id', {data: foundGroups}).value;
    UserSchema.statics.getUsers(adminUsers, false, function (err, existingAdminUsers){
      if (err) return next(err);
      res.adminUsers = existingAdminUsers;
      next();
    });
  });
}


module.exports = mongoose.model('Users', UserSchema)