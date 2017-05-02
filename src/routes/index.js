var express = require('express');
var router = express.Router();
var Token = require('../token');
var Users = require('../models/Users.js');
var Groups = require('../models/Groups.js');
var jsonQuery = require('json-query');
var token = require('../token');


/* GET home page. */
// Check for existing admin and show install page if not found
router.get('/', token.check, function(req, res, next) {
	Groups.getGroupMembers(['admins'], true, function (err, foundUsers) {
		if(err) return next(err);
		if (foundUsers['admins'].length === 0){
			//no Admin users found, so show install options
			res.render('pages/install/index', renderObject);
		}else{
			console.log(req.userMetadata);

			var renderObject = {
				title: "HRA IIIF API Frontend",
				userMetadata: req.userMetadata,
				admin: req.userMetadata.admin
			};
			res.render('pages/index', renderObject);
		}		
	});



});

module.exports = router;
