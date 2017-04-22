/**
* @email: samurai@gono.info
* @Author: Matthias Guth
* @Date:   2017-04-22 16:33:59
* @Last Modified by:   Matthias Guth
* @Last Modified time: 2017-04-22 19:48:25
*/

'use strict';

var express = require('express');
var docRouter = express.Router();
const path = require('path');
var app = express();

docRouter.get('*',function(req, res) {
	if (process.env.NODE_ENV == 'development'){
		res.sendFile(path.join(__dirname, '/../doc') + req.url);
	}
});


module.exports = docRouter;
