var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var Users = require('./models/Users.js');
var Groups = require('./models/Groups.js');

module.exports = {
	check: function(req, res, next) {
		if(req.signedCookies['x-access-token']){
			var token = req.signedCookies['x-access-token'];
			jwt.verify(token, config.secret, function(err, decoded) {
		    	if (err) return next(err);
		    	// Token is verified, so get the user metadata
		    	Users.findOne({username: decoded.username, active: true}, {_id:0, password: 0}, function(err, user) {
		    		if(err) return next(err);
		    		//add User metadata to request
					req.userMetadata = user.toObject();
		    		return next();
		    	});
			});
		}else{
			req.userMetadata = {
				username: "guest",
			    fullName: "Guest User",
    			displayName: "Guest User",
    			scope: "local",
    			email: "",
    			groups: []
			};
			res.locals.userMetadata = req.userMetadata;
			return next();
		}
		
  }
}