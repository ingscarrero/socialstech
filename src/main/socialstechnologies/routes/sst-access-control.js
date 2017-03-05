
var authorization = require('../server/shared/authorization');
var securityDomain = require('../server/domain/securityDomain');
var model = require('../server/model/security');
var express = require('express');
var router = express.Router();
var request = require("request");


router.post('/signin', authorization.ensureSecure, function(req, res, next){
	securityDomain.signIn(req.body.login, 
		req.body.password).then(function(identity){

			var identityInformation = {
				token: identity.token,
				issuedOn: identity.createdBy.on
			};

			message = { 
		  		code: 0,
		  		message: 'Your account was created succesfully',
		  		data: identityInformation
		  	}
		  	res.status(200).jsonp(message);

		}).catch(err=>{
			console.log(err)
  			res.status(500).jsonp(err);
		});
});

router.post('/login', authorization.ensureSecure, function(req, res, next){
	
	securityDomain.credential.find(
			req.body.login,
			req.body.password
		).then(function(credential){

			
			if (credential) {
				
				if (credential.isActive) {
					securityDomain.identity.findById(credential.identityId)
						.then(function(identity){
							securityDomain.authenticateWithProvider(
								'local',
								identity.token)
								.then(function(identity){
									var identityInformation = {
										token: identity.token,
										issuedOn: identity.createdBy.on
									};

									message = { 
								  		code: 0,
								  		message: "Identity was successfully authenticated.",
								  		data: identityInformation
								  	}
								  	res.status(200).jsonp(message);

								}).catch(err=>{
									// Expired JWT
									securityDomain.identity.regenerateToken(identity)
										.then(function(identity){
											
											var identityInformation = {
												token: identity.token,
												issuedOn: identity.createdBy.on
											};

											message = { 
										  		code: 0,
										  		message: "Identity was successfully authenticated.",
										  		data: identityInformation
										  	}
										  	res.status(200).jsonp(message);

										}).catch(err=>{
											
											console.log(err)
  											res.status(500).jsonp(err);

										});
									
								});
						}).catch(err=>{
							console.log(err)
  							res.status(500).jsonp(err);
						});
				} else {
					
					message = { 
				  		code: -1,
				  		message: "Invalid login or password.",
				  		data: "The given credential is not active."
				  	}
				  	res.status(500).jsonp(message);
				}
			} else {


				message = { 
				  		code: -1,
				  		message: "Invalid login or password.",
				  		data: "No data was retrieved for the provided login and password."
				  	}
				res.status(500).jsonp(message);

			}
		}).catch(err=>{
			
			console.log(err)
			res.status(500).jsonp(err);
		});
});

router.get('/profile', authorization.ensureSecure, authorization.isAuthorized, function(req, res){
	securityDomain.authenticateWithProvider('local', req.token)
		.then(function(identity){
			securityDomain.user.findById(identity.internalUserId)
				.then(function(user){
					securityDomain.contact.findById(user.contactId)
						.then(function(contact){

							var profileInformation = {
								user: user,
								contact: contact
							};

							message = { 
						  		code: 0,
						  		message: "Identity was successfully authenticated.",
						  		data: profileInformation
						  	}
						  	res.status(200).jsonp(message);

						}).catch(err=>{
							console.log(err)
							res.status(500).jsonp(err);
						});
				}).catch(err=>{
					console.log(err)
					res.status(500).jsonp(err);
				});
		}).catch(err=>{
			console.log(err)
			res.status(500).jsonp(err);
		});
});

module.exports = router;