var express = require('express');
var ejs = require('ejs');
var installRouter = express.Router();
var Users = require('../models/Users.js');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false });


installRouter.get('/', function(req, res, next) {
	return next();
});

module.exports = installRouter;