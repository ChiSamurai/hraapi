var express = require('express');
var ejs = require('ejs');
var installRouter = express.Router();
var Users = require('../models/Users.js');
var Groups = require('../models/Groups.js');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false });


installRouter.post('/doInstall/:step', Users.adminExists, function (req, res, next) {
	/* Steps:
		1: create adminGroup & User 
	*/
	console.log(req.params);
	console.log(req.body);
	switch(parseInt(req.params.step)){
		case 1:
			//Create an admin user (if it does not already exist)
			if(!req.adminExists){
				var userData = req.body;
				userData.source = "local",
				userData.active = true;
				var adminUser = new Users(userData);
				//Save user into MongoDB
				adminUser.save(function(err) {
					if(err) return next(err);
					else{
						//create the admin group
						var adminGroupData = {
							groupname: "admins",
							source: "local",
							creator: userData.username,
							active: true,
							members: [{
								name: userData.username,
								type: "user"
							}],
							managers:[
								{
									name: userData.username,
									type: "user"
								},
								{
									name: "admins",
									type: "group"
								}
							]
						};
						var adminGroup = new Groups(adminGroupData);
						//Save admin Group
						adminGroup.save(function (err) {
							if(err) return next(err);
							else{
								res.status(200);
								res.send("admin user and group successfully created.");
							}
						});
					}
				});
			}else{
			    res.status(401);
				res.send("admin user already exists.");
			}
			break;
	}
});

installRouter.get('/', function(req, res, next) {
	return next();
});


module.exports = installRouter;