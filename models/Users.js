var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var uuid = require('uuid/v4');

var UserSchema = new mongoose.Schema({
	"userId": {type:String, required:true, unique:true, dropDups: true, default: uuid},
  "source": {type:String, required:true, unique:false, default: "local"}, //local or ldap? (or anything else in the future)
  "username": {type:String, required:true, unique: true},
	"forename": {type:String, required:false},
	"lastname": {type:String, required:false},
  "password": { type: String, required: true }, //this is ignored if user.source is not "local"
	"email": {type:String, required:true},
	/*"roles": {type: Array, required:false, default:[]}*/
  },{
    timestamps: true
  }
);

UserSchema.pre('save', function(next) {
    var user = this;
    console.log(this);

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

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
  });
};

UserSchema.statics.checkAdmin = function(req, res, next) {
  if(req.userMetadata.admin) return next();
  res.status(403);
  res.send("admins only!");
};

UserSchema.statics.checkAdminExisting = function(req, res, next){

};

module.exports = mongoose.model('Users', UserSchema);