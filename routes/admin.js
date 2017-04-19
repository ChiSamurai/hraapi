var express = require('express');
var ejs = require('ejs');
var adminRouter = express.Router();
var Token = require('../token');
var Manifests = require('../models/Manifests.js');

var Users = require('../models/Users.js');
var Groups = require('../models/Groups.js');
var Permissions = require('../models/Permissions.js');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET /manifest */
/* get available manifests */

adminRouter.get('/', Token.check, Users.checkAdmin, function(req, res, next) {
	var	renderObject;
	renderObject = {
		subtitle: "HRA IIIF API Frontend",
		admin: req.userMetadata.admin
/*		admin: true*/
	};
	res.render('pages/admin/collectionsAndManifests', renderObject);

});

adminRouter.get('/collectionsAndManifests', Token.check, Users.checkAdmin, function(req, res, next) {
/*adminRouter.get('/collectionsAndManifests', Token.check, function(req, res, next) {*/
	Manifests.getAllManifests(function (err, manifests) {
		if(err) {
			manifests = [];
		}
		// body...
		renderObject = {
			subtitle: "collectons and manifests overview",
			manifests: manifests,
			manifestStatics: Manifests.iiifSchemaVars,
			admin: req.userMetadata.admin
		};
		/*console.log(manifests)*/
		res.render('pages/admin/collectionsAndManifests', renderObject);

	});
});

adminRouter.get('/entityPermissions/:entityId/:format?', Token.check, Users.checkAdmin, function(req, res, next) {
	//get the permissions for this entity
	Permissions.getPermissionsEntry(req.params.entityId, function(err, permissionsJson) {
        if (err) return next(err);
/*        console.log(permissionsJson);*/
        permissionsJson['defaultPermissions'] = {
			"read" : true,
			"create" : true,
			"modify" : true,
			"delete" : true
		};
/*        console.log(permissionsJson);
*/
        switch(req.params.format){
			case "templatePart":
		        ejs.renderFile('views/partials/admin/permissionsEntry.ejs', permissionsJson, function(err, rendered){
		        	if (err) return next(err);
					res.send(rendered);
		        });
		     	break;
		    case "json":
		    	res.json(permissionsJson);
		    	break;
		    default:
		        ejs.renderFile('views/partials/admin/permissionsEntry.ejs', permissionsJson, function(err, rendered){
		        	if (err) return next(err);
			    	res.json({
			    		html: rendered,
			    		json: permissionsJson
			    	})
		    	});
	    }
	});
});

/*adminRouter.post('/users/add', Token.check, Users.checkAdmin, function(req, res, nect) {*/
adminRouter.post('/users/add', function(req, res, next) {
	//add a new user
  	var newUser = new Users(req.body);
/*  	console.log(testuser);*/
	newUser.save(function(err) {
    	if (err){
			res.status(500);
		    return res.json(err);
	   }
	});
    

    /*Permissions.getUserPermissionsForId(req, canvasId, function(err, permissions) {
      if(typeof(permissions.create) !== "undefined"  && permissions.create === true){
        var anno = {
            createdBy: req.userMetadata.userId,
            oaAnnotation: req.body
          };
        var annoId = Tools.fullUrl(req) + "/" + uuid();
        anno.oaAnnotation["@id"] = annoId;
        //Create the annotation
        Annotations.create(anno, function (err, post) {
          var storedAnno = post;
          if (err) next(err);
          //create permissions with full access for creating user and admin group
          Permissions.createEntityPermissions(req, annoId, "oa:Annotation", function(err, post) {
            if (err) return next(err);
            res.status(200);
            res.send(storedAnno.oaAnnotation);
          });  
        });
      }else{
        res.status(403);
        res.json("You don't have permissions to CREATE annotations to this entity");
      }
    });*/
});

adminRouter.post('/groups/add', function(req, res, next) {
	//add a new group
  	var newGroup = new Groups(req.body);
  	console.log(newGroup);
	newGroup.save(function(err) {
    	if (err){
			res.status(500);
		    return res.json(err);
	   }
	});
});

/*adminRouter.post('/importFSDir', Token.check, Users.checkAdmin, urlencodedParser, function(req, res, next) {

});
*/
module.exports = adminRouter;
