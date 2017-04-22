var express = require('express');
var router = express.Router();
var Token = require('../token');
var Users = require('../models/Users.js');
var Groups = require('../models/Groups.js');

/* GET home page. */
// Check for existing admin and show install page if not found
router.get('/', Users.getAdminUsers, Token.check, function(req, res, next) {
	
	if (res.adminUsers.length === 0){
		//no Admin users found, so show install options
		res.render('pages/install/index', renderObject);
	}else{
		var renderObject = {
			title: "HRA IIIF API Frontend",
			userMetadata: req.userMetadata,
	//		admin: req.userMetadata.admin
			admin: true
		};

		res.render('pages/index', renderObject);
	}
});

module.exports = router;
