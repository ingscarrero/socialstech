// security.js
var express = require('express');
var auth = require('../config/auth');
var express = require('express');
var mongoose = require('mongoose');
var model = require('../model/security');
var jwt = require("jsonwebtoken");
var request = require("request");

// Registration & Login

function signIn(login, password){
	return new Promise(function(resolve, reject){
		try{
			findCredential(login, password).then(function(credential){
				if (credential) {
					reject({
						code: 209,
						message: 'Invalid credentials. Login is already registered. Please try again with a different one.',
						error: 'Repeated login. Can\'t process Signin request.'
					});
				}
			}).catch(err=>{
				createIdentity('local', login, password).then(function(identity){
						resolve(identity);
					}).catch(err=>reject(err));
			});
		} catch (ex){
			var err = {
				code: 500,
				message: 'It wasn\'t possible to sign in. There were errors in the process. Please try again.',
				error: ex
			}
			reject(err);
		}
	});
}

function authenticateWithProvider(provider, token){
	var isLocal = 'local' == provider;
	return new Promise(function(resolve, reject){
		try{
			validateToken(provider, token).then(function(profile){
				if (isLocal) {
					model.identity.findOne({
						internalUserId: profile.id
					}, function(err, identity){
						if (!err) {
							if (identity) {
								identity.token = token;
								identity.createdBy = {
										_id:'WEB_APP', 
										on:Date()
									}
								identity.save(function(err, updatedIdentity){
									resolve(updatedIdentity)
								})
							} else {
								createIdentity(provider, profile).then(function(identity){
									resolve(identity);
								}).catch(err=>reject(err));
							}
						} else {
							var err = {
								code: 500,
								message: 'It wasn\'t possible to authenticate token. There were errors in the process. Please validate the information and try again.',
								error: ex
							}
							reject(err);
						}
					})
				} else {
					model.identity.findOne({
						externalUserId: profile.id,
						type: provider
					}, function(err, identity){
						if (!err) {
							if (identity) {
								validateToken(identity.token)
									.then(function(profile){
										resolve(identity);		
									}).catch(err=>{
										updateIdentityLocalToken(identity)
											.then(function(updatedIdentity){
												resolve(updatedIdentity);
											}).catch(err=>reject(err));
									})
								
							} else {
								if (profile.email) {
									findUserByEmail(email).then(function(user){
										if(user){
											createIdentity(provider, profile, user.internalUserId).then(function(identity){
												resolve(identity);
											}).catch(err=>reject(err));		
										} else {
											createIdentity(provider, profile, null).then(function(identity){
												resolve(identity);
											}).catch(err=>reject(err));			
										}
									}).catch(err=>reject(err));	
								} else {
									createIdentity(provider, profile, null).then(function(identity){
										resolve(identity);
									}).catch(err=>reject(err));	
								}
							}
						} else {
							reject(err);
						}
					});
				}
			}).catch(err=>reject(err));
		} catch (ex) {
			var err = {
				code: 500,
				message: 'It wasn\'t possible to authenticate token. There were errors in the process. Please validate the information and try again.',
				error: ex
			};
			reject(err);
		}
	});
}

// Token

function validateFacebookToken(token){
	return new Promise(function(resolve, reject){
		var options = {
			uri:'https://graph.facebook.com/me', 
			qs:{access_token:token}
		};
		request(options, function(error, response, body){
			if (!error) {
				var data = JSON.parse(body);
				
				if (!data.error) {
					var profile = data;
					resolve(profile);
				} else {
					var err = {
						code: 409,
						message: 'It wasn\'t possible to authenticate facebook token.',
						error: data.error
					};
					reject(err);
				}
			} else {
				reject(error)
			}
		});
	});
}

function validateTwitterToken(token){
	return new Promise(function(resolve, reject){
		var err = {
			code: 409,
			message: 'Ups!, you picked for an invalid or not yet supported provider.',
			error: 'Selected provider is not currently supported.'
		}
		reject(err);
	});
}

function validateGoogleToken(token){
	return new Promise(function(resolve, reject){
		var err = {
			code: 409,
			message: 'Ups!, you picked for an invalid or not yet supported provider.',
			error: 'Selected provider is not currently supported.'
		}
		reject(err);
	});
}

function validateToken(provider, token){
	var isLocal = 'local' == provider;
	return new Promise(function(resolve, reject){
		if (isLocal) {
			try{
				var profile = jwt.verify(token, auth.localAuth.secret).data;
				resolve(profile);
			} catch (ex) {
				var err = {
					code: 409,
					message: 'Invalid or expired token.',
					error: ex
				};
				reject(err);
			}
		} else {
			switch(provider){
				case 'facebook':
					validateFacebookToken(token).then(function(profile){
						resolve(profile);
					}).catch(err=>reject(err));
					break;
				case 'google':
					validateGoogleToken(token).then(function(profile){
						resolve(profile);
					}).catch(err=>reject(err));
					break;
				case 'twitter':
					validateTwitterToken(token).then(function(profile){
						resolve(profile);
					}).catch(err=>reject(err));
					break;
				default:
					var err = {
						code: 409,
						message: 'Ups!, you picked for an invalid or not yet supported provider.',
						error: 'Selected provider is not currently supported.'
					}
					reject(err);
					break;
			}
		}
	});
}

function generateLocalToken(identityIdentifier){
	var generatedToken = jwt.sign(
		{ 
			data: {
				id: identityIdentifier
			}
		}, 
		auth.localAuth.secret, 
		{ 
			expiresIn: auth.localAuth.expiration,
			issuer: auth.localAuth.issuer
		});
	return generatedToken;
}

// CRUD

function createIdentity(){
	var type = arguments[0];
	var isLocal = type == 'local';
	if (isLocal){
		var login = arguments[1];
		var password = arguments[2];
	} else {
		var provider = arguments[0];
		var profile = arguments[1];
		var userId = arguments[2];
	}

	return new Promise(function(resolve, reject){
		if (isLocal){
			createContact(login, null, null).then(function(contact){
				createUser(login, contact._id).then(function(user){
					var newIdentity = model.identity({
						_id: 			mongoose.Types.ObjectId(),
						type: 			provider,
						token: 			generateLocalToken(user._id),
						externalUserId: null,
						internalUserId: user._id,
						createdBy: 		{
											_id:'WEB_APP', 
											on:Date()
										}
					});
						
					newIdentity.save(function(err, registeredIdentity){
						if (!err) {

							console.log(registeredIdentity);

							createCredential(login, password, registeredIdentity.id).then(function(credential){
								resolve(registeredIdentity);
							}).catch(err=>reject(err));
						} else {
							reject(err);
						}	
					});

				}).catch(err=>reject(err));
			}).catch(err=>reject(err));
		} else {
			if (!userId) {
				createContact(profile.name, profile.email, profile.phones).then(function(contact){
					createUser(profile.name, contact._id).then(function(user){
						var newIdentity = model.identity({
							_id: 			mongoose.Types.ObjectId(),
							type: 			provider,
							token: 			generateLocalToken(user._id),
							externalUserId: profile.id,
							internalUserId: user._id,
							createdBy: 		{
												_id:'WEB_APP', 
												on:Date()
											}
						});
							
						newIdentity.save(function(err, registeredIdentity){
							if (!err) {
								resolve(registeredIdentity);
							} else {
								reject(err);
							}	
						});
					}).catch(err=>reject(err));
					
				}).catch(err=>reject(err));
			} else {
				model.user.findOne({
					_id: userId
				}, function(err, user){
					if (!err) {
						if(user){
							var newIdentity = model.identity({
								_id: 			mongoose.Types.ObjectId(),
								type: 			provider,
								token: 			generateLocalToken(user._id),
								externalUserId: profile.id,
								internalUserId: user._id,
								createdBy: 		{
													_id:'WEB_APP', 
													on:Date()
												}
							});
								
							newIdentity.save(function(err, registeredIdentity){
								if (!err) {
									resolve(registeredIdentity);
								} else {
									reject(err);
								}	
							});
						} else {
							reject({
								code: 209,
								message: 'Invalid user.',
								error: 'Provided user identifier is not valid. Can\'t process Signin request.'
							});
						}
					} else {
						var err = {
							code: 500,
							message: 'It wasn\'t possible to authenticate token. There were errors in the process. Please validate the information and try again.',
							error: ex
						}
						handleError(err, res);
						reject(err);
					}
				});
			}
		}
	});
}

function updateIdentityLocalToken(identity){
	return new Promise(function(resolve, reject){
		try{

			identity.token = generateLocalToken(identity.internalUserId);
			identity.createdBy = {
				_id: "WEB_APP",
				on: Date()
			}
			console.log(identity);
			identity.save(function(err, updatedIdentity){
				if(!err){
					resolve(updatedIdentity);
				} else {
					reject(err);
				}
			});
		} catch (ex){
			var err = {
				code: 500,
				message: 'It wasn\'t possible to login. There were errors in the process. Please try again.',
				error: ex
			}
			reject(err);
		}
	});
}

function findIdentityById(identityIdentifier){
	return new Promise(function(resolve, reject){
		model.identity.findOne({_id:identityIdentifier},
			function(err, identity){
			if (!err) {
				resolve(identity);
			} else {
				reject(err);
			}
		});
	});
}

function createContact(full_name, email, phones){
	return new Promise(function(resolve, reject){
		var newContact = model.contact({
			_id: 		mongoose.Types.ObjectId(),
			fullName: 	full_name, 
			email: 		email,
			phones: 	phones,
			createdBy: 	{
							_id:'WEB_APP', 
							on:Date()
						}
		});
		newContact.save(function(err, registeredContact){
			if(!err){
				resolve(registeredContact);
			} else {
				reject(err);
			}
		});
	});
}

function updateContact(full_name, email, phones, country

function findContactById(contactIdentifier){
	return new Promise(function(resolve, reject){
		model.contact.findOne({
			_id: contactIdentifier
		}, function(err, contact){
			if (!err) {
				resolve(contact);
			} else {
				reject(err);
			}
		});
		
	});
}

function createUser(name, contactId){

	return new Promise(function(resolve, reject){
		var newUser = model.user({
			_id: 		mongoose.Types.ObjectId(),
			contactId: 	contactId,
			name: 		name,
			roles: 		['user'],
			createdBy: 	{
							_id:'WEB_APP', 
							on:Date()
						}	
		});
		newUser.save(function(err, registeredUser){
			if(!err){
				resolve(registeredUser);
			} else {
				reject(err);
			}
		});
	});
}

function findUserById(userIdentifier){
	return new Promise(function(resolve, reject){
		model.user.findOne({_id:userIdentifier}, function(err, user){
			if (!err) {
				resolve(user);							
			} else {
				reject(err);
			}
		});
	});	
}

function findUserByEmail(email){
	return new Promise(function(resolve, reject){
		model.contact.findOne({email:email}, function(err, contact){
			if (!err) {
				if (contact) {
					model.user.findOne({contactId: contact._id}, function(err, user){
						if (!err) {
							resolve(user);							
						} else {
							reject(err);
						}
					});	
				} else {
					resolve(null);
				}
			} else {
				reject(err);
			}
		});	
	});
}

function createCredential(login, password, identityId){
	return new Promise(function(resolve, reject){
		var credential = model.credential({
			_id: 		mongoose.Types.ObjectId(),
			login: 		login,
			password: 	password,
			isActive:   true,
			identityId: identityId,
			createdBy: 	{
							_id:'WEB_APP', 
							on:Date()
						}	
		});
		credential.save(function(err, registeredCredential){
			if(!err){
				resolve(registeredCredential);
			} else {
				reject(err);
			}
		});
	});
}

function findCredential(login, password){
	return new Promise(function(resolve, reject){
		model.credential.findOne({
			login: login
		}, function(err, credential){
			if (!err) {
				if (credential) {
					if (credential.password == password) {
						resolve(credential);
					} else {
						var err = {
							code: 404,
							message: 'Invalid password. There were no matches either for provided login or password.',
							error: 'Invalid password.'
						}
						reject(err);
					}
				} else {
					var err = {
						code: 404,
						message: 'No credential satisfies the search criteria.',
						error: 'No credential was found for the provided login.'
					}
					reject(err);
				}
			} else {
				reject(err);
			}
		});
		
	});
}

// Helpers

function handleError(err, res){
	try{
		console.log('===== Handle ======');
		console.log(err);
		res.status(err.code).jsonp({ message:err.message, error: err });
		console.log('===== Handle ======');
	} catch (ex) {
		console.log(ex);
	}
}

module.exports = {
	signIn: signIn,
	authenticateWithProvider: authenticateWithProvider,
	validateToken: validateToken,
	handleError: handleError,
	user: { 
		findByEmail: findUserByEmail,
		findById: findUserById
	},
	contact: {
		findById: findContactById
	},
	credential: {
		find: findCredential
	},
	identity:{
		findById: findIdentityById,
		regenerateToken: updateIdentityLocalToken
	}
}