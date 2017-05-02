var express = require('express');
var ejs = require('ejs');
var installRouter = express.Router();
var Users = require('../models/Users.js');
var Groups = require('../models/Groups.js');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false });


installRouter.get('/', function(req, res, next) {
	return next();
});

installRouter.post('/doInstall', function (req, res, next) {
	var newAdminUser = new Users({
		username: req.body.username
	});

/*	var adminGroup = new Groups();
*/	//Search for the admin group

	Groups.find({groupname: "admins"}, function (err, result){

		Users.getAdminUsers(req, res, function(req, res, next) {
			console.log(res.adminUsers);
		});
/*		//if adminGroup exists and has an active Member 
		if (err) return next(err);
		if(result.length > 0){
			//admin group found, check the users
			var getActiveAdminUsersQuery = {$and: [{"username": { $in: result[0].members}}, {"active": true}]}; 
			Users.find(getActiveAdminUsersQuery, function (err, foundUsers) {
				if (err) return next(err);
				if(foundUsers.length > 0){
					//there is an active admin
					res.status(401);
					res.send("Admin user exists. Installation already completed");
				}else{
					res.status(200);
					var adminGroup = new Groups({
						"source": "local",
    					"groupname": "admins",
    					"creator" : "SYSTEM",
    					"members" : [
        					{
 					           "id": { type:String, unique:true},
            					"type": { type:String, enum: ["user", "group"]}
        					}
    					],
    					"managers":[
        					{
            					"id": { type:String, unique:true},
            					"type": { type:String, enum: ["user", "group"]}
        					}
    					]
					});
					res.send("No admin user in Group -> Create Admin User");
				}
				
			});
		}else{
			res.status(200);
			//group not found. Create admin user and admin Group
			//
			res.send("No admin Group -> Create Admin User and Group");
			

		}
*/
		
	});
});

module.exports = installRouter;