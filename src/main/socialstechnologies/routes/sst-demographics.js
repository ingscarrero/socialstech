
var authorization = require('../server/shared/authorization');
var securityDomain = require('../server/domain/securityDomain');
var model = require('../server/model/security');
var express = require('express');
var router = express.Router();
var request = require("request");


router.put('/:customer_id', authorization.ensureSecure, function(req, res, next){
	var customer_id = 	req.params.customer_id;
	var contact		=	req.body;

	securityDomain.contact.update(
		customer_id, 
		contact.full_name, 
		contact.email, 
		contact.phones, 
		contact.country,
		contact.gender,
		contact.picture, 
		contact.modifiedBy
		).then((updatedContact)=>{
			message = { 
		  		code: 0,
		  		message: 'Your demographics information was updated succesfully',
		  		data: updatedContact
		  	}
		  	res.status(200).jsonp(message);			
		}).catch((err)=>{
			console.log(err)
  			res.status(500).jsonp(err);
		});
});

module.exports = router;