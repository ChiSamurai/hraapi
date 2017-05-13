var express = require('express');
var router = express.Router();
var Token = require('../token');
var Users = require('../models/Users.js');
var Groups = require('../models/Groups.js');
var jsonQuery = require('json-query');
var token = require('../token');


/* GET home page. */
// Check for existing admin and show install page if not found
router.get('/', Users.adminExists, token.check, function(req, res, next) {
	if (req.adminExists){
		console.log(req.userMetadata);
		var renderObject = {
			title: "HRA IIIF API Frontend",
			userMetadata: req.userMetadata,
			admin: req.userMetadata.admin
		};
		res.render('pages/index', renderObject);
	}else{
		//no Admin users found, so show install options
		res.render('pages/install/index', renderObject);
	}
});

module.exports = router;
