var authorization = require('../server/shared/authorization');
var express = require('express');
var router = express.Router();
var domain = require('../server/domain/siteDomain');

/* GET home page. */
router.get('/:name', function(req, res, next) {
	var contentName = req.params.name 
  	domain.content.read(contentName).then(function(content){
	  	message = { 
	  		code: 0,
	  		message: 'SST Contents were retrieved successfully',
	  		data: content
	  	}
	  	res.status(200).jsonp(message)
	  }
  ).catch(ex=>{ 
  	console.log(ex)
  	res.status(500).jsonp(ex)})
});

router.post('/', authorization.ensureSecure, authorization.isAuthorized, function(req, res, next) {
	var content = req.body
	console.log(content)
  	domain.content.set(content).then(function(content){
	  	message = { 
	  		code: 0,
	  		message: 'SST Contents was submmited successfully',
	  		data: content
	  	}
	  	res.status(200).jsonp(message)
	  }
  ).catch(ex=>{ 
  	console.log(ex)
  	res.status(500).jsonp(ex)})
});

module.exports = router;