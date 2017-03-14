// security.js
'use strict';
var express = require('express');
var auth = require('../config/auth');
var mongoose = require('mongoose');
var model = require('../model/security');
var jwt = require("jsonwebtoken");
var request = require("request");
var crypto = require('crypto');
var util = require('../shared/util')

// Registration & Login


function checkForPendingActivation(user_id) {
	return new Promise(function (resolve, reject) {
		findUserById(user_id).then(user => {
			if (user) {
				console.log('Pending activation validated');
				if (!user.isActive || !user.isApproved) {
					resolve(true);
					return;
				} else {
					resolve(false);
					return;
				}
			} else {
				var error = util.error.invalidRequest({
					code: util.constants.error.data,
					description: 'Error at Check for User Pending Activation [checkForPendingActivation]. User not found.'
				});
				reject(error);
				return;
			}
		}).catch(err => {
			reject(err);
			return;
		})
	});
}

function signIn(login, password) {
	return new Promise(function (resolve, reject) {
		findCredential(login, password)
			.then(function (credential) {
				if (credential) {
					var error = util.error.invalidRequest({
						code: util.constants.error.data,
						description: 'The provided login is not available.'
					})
					reject(error);
					return;
				}
			}).catch(err => {
				createIdentity(
					util.constants.authentication.local,
					login,
					password
				).then(function (identity) {
					resolve(identity);
					return;
				}).catch(err => {
					reject(err);
					return;
				});
			});
	});
}

function authenticateWithProvider(provider, token) {
	var isLocal = util.constants.authentication.local == provider;
	return new Promise(function (resolve, reject) {
		validateToken(provider, token)
			.then(profile => {
				if (isLocal) {
					return findIdentityByInternalUserIdentifier(profile.id);
				} else {
					model.identity.findOne({
						externalUserId: profile.id,
						type: provider
					}, function (err, identity) {
						if (!err) {
							if (identity) {
								return updateIdentityToken(identity, token);
							} else {
								if (profile.email) {
									findUserByEmail(email)
										.then(function (user) {
											if (user) {
												return createIdentity(
													provider,
													profile,
													user.internalUserId
												);
											} else {
												return createIdentity(
													provider,
													profile
												);
											}
										}).catch(err => {
											reject(err);
											return;
										});
								} else {
									return createIdentity(
										provider,
										profile
									)
								}
							}
						} else {
							var error = util.error.api(err, {
								code: util.constants.error.persistance,
								description: 'Error at authenticate with provider [authenticateWithProvider] for provider ' + provider
							})
							reject(err);
							return;
						}
					});
				}
			}).then(identity => {
				if (identity) {
					console.log('Token authenticated.');
					resolve(identity);
				} else {
					var error = util.error.invalidRequest({
						code: util.constants.error.data,
						description: 'Token\'s identity not found.'
					})
					reject(error);
				}
				return;
			}).catch(err => {
				reject(err);
				return;
			});
	});
}

// Token

function validateFacebookToken(token) {
	return new Promise(function (resolve, reject) {
		var options = {
			uri: 'https://graph.facebook.com/me',
			qs: {
				access_token: token
			}
		};
		request(options, function (err, response, body) {
			if (!err) {
				var data = JSON.parse(body);

				if (!data.error) {
					var profile = data;
					resolve(profile);
					return;
				} else {
					console.log(data.error);
					var error = util.error.generic(409, {
						code: util.constants.error.externalProvider,
						description: 'Error at facebook token validation'
					})
					reject(error);
					return;
				}
			} else {
				var error = util.error.api(err, {
					code: util.constants.error.externalProvider,
					description: 'Error at facebook token validation'
				})
				reject(error);
				return;
			}
		});
	});
}

function validateTwitterToken(token) {
	return new Promise(function (resolve, reject) {
		var error = util.error.invalidRequest({
			code: util.constants.error.data,
			description: 'Selected provider is not currently supported.'
		});
		reject(error);
	});
}

function validateGoogleToken(token) {
	return new Promise(function (resolve, reject) {
		var error = util.error.invalidRequest({
			code: util.constants.error.data,
			description: 'Selected provider is not currently supported.'
		});
		reject(error);
		return;
	});
}

function validateToken(provider, token) {
	var isLocal = 'local' == provider;
	return new Promise(function (resolve, reject) {
		if (isLocal) {
			try {
				var profile = jwt.verify(token, auth.localAuth.secret).data;
				console.log('Local Token Validated.');
				resolve(profile);
				return;
			} catch (ex) {
				console.log(ex);
				var error = util.error.generic(409, {
					code: util.constants.error.expired,
					description: 'Invalid or expired token.'
				});
				reject(error);
				return;
			}
		} else {
			switch (provider) {
				case 'facebook':
					validateFacebookToken(token).then(function (profile) {
						console.log('Facebook Token Validated.');
						resolve(profile);
						return;
					}).catch(err => {
						reject(err);
						return;
					});
					break;
				case 'google':
					validateGoogleToken(token).then(function (profile) {
						console.log('Google Token Validated.');
						resolve(profile);
						return;
					}).catch(err => {
						reject(err);
						return;
					});
					break;
				case 'twitter':
					validateTwitterToken(token).then(function (profile) {
						console.log('Twitter Token Validated.');
						resolve(profile);
						return;
					}).catch(err => {
						reject(err);
						return;
					});
					break;
				default:
					var error = util.error.invalidRequest({
						code: util.constants.error.data,
						description: 'Selected provider is not currently supported.'
					});
					reject(error);
					break;
			}
			return;
		}
	});
}

function generateLocalToken(identityIdentifier) {
	var generatedToken = jwt.sign({
			data: {
				id: identityIdentifier
			}
		},
		auth.localAuth.secret, {
			expiresIn: auth.localAuth.expiration,
			issuer: auth.localAuth.issuer
		});
	return generatedToken;
}

// CRUD

// Identity

function createIdentity() {

	var type = arguments[util.constants.arguments.createIdentity.type];
	var isLocal = type == util.constants.authentication.local;
	var identity;

	if (isLocal) {
		var login = arguments[util.constants.arguments.createIdentity.login];
		var password = arguments[util.constants.arguments.createIdentity.password];
	} else {
		var provider = arguments[util.constants.arguments.createIdentity.provider];
		var profile = arguments[util.constants.arguments.createIdentity.profile];
		var userId = arguments[util.constants.arguments.createIdentity.userId];
	}

	return new Promise(function (resolve, reject) {
		if (isLocal) {
			createContact(login)
				.then(contact => {
					return createUser(login, contact._id);
				}).then(user => {
					var newIdentity = model.identity({
						_id: mongoose.Types.ObjectId(),
						type: provider,
						token: generateLocalToken(user._id),
						externalUserId: null,
						internalUserId: user._id,
						createdBy: {
							_id: util.constants.appUser,
							on: Date()
						}
					});
					return newIdentity.save()
						.then(registeredIdentity => {
							identity = registeredIdentity;
							return createCredential(
								login,
								password,
								registeredIdentity._id);
						}, error => {
							var error = util.error.api(err, {
								code: util.constants.error.persistance,
								description: 'Error at create local identity [createIdentity].'
							})
							reject(error);
							return;
						});
				}).then(credential => {
					console.log('Identity created.');
					resolve(identity);
					return;
				}).catch(err => {
					reject(err);
					return;
				})
		} else {
			if (!userId) {
				createContact(profile.name,
					profile.email,
					profile.phones
				).then(contact => {
					return createUser(profile.name,
						contact_id);
				}).then(user => {
					var newIdentity = model.identity({
						_id: mongoose.Types.ObjectId(),
						type: provider,
						token: generateLocalToken(user._id),
						externalUserId: profile.id,
						internalUserId: user._id,
						createdBy: {
							_id: util.constants.appUser,
							on: Date()
						}
					});

					return newIdentity.save()
						.then(registeredIdentity => {

							identity = registeredIdentity;
							console.log('Identity created.');
							resolve(identity);
							return;
						}, err => {

							var error = util.error.api(err, {
								code: util.constants.error.persistance,
								description: 'Error at create identity [createIdentity] for and new user .'
							})
							reject(error);
							return;
						});
				}).catch(err => {
					reject(err);
					return;
				})
			} else {

				findUserById(userId)
					.then(user => {
						if (user) {
							var newIdentity = model.identity({
								_id: mongoose.Types.ObjectId(),
								type: provider,
								token: generateLocalToken(user._id),
								externalUserId: profile.id,
								internalUserId: user._id,
								createdBy: {
									_id: util.constants.appUser,
									on: Date()
								}
							});

							return newIdentity.save()
								.then(registeredIdentity => {
									identity = registeredIdentity;
									console.log('Identity created.');
									resolve(identity);
									return;
								}, err => {
									var error = util.error.api(err, {
										code: util.constants.error.persistance,
										description: 'Error at create identity [createIdentity].'
									})
									reject(error);
									return;
								});
						} else {
							var error = util.error.invalidRequest({
								code: util.constants.error.data,
								description: 'Invalid user.'
							});
							reject(error);
							return;
						}
					}).catch(err => {
						reject(err);
						return;
					});
			}
		}
	})

}

function updateIdentityToken(identity, token) {
	return new Promise(function (resolve, reject) {
		try {
			identity.token = token ? token : generateLocalToken(
				identity.internalUserId
			);
			identity.createdBy = {
				_id: util.constants.appUser,
				on: Date()
			}

			return identity.save()
				.then(updatedIdentity => {
					console.log('Identity updated.')
					resolve(updatedIdentity);
					return;
				}, err => {
					var error = util.error.api(err, {
						code: util.constants.error.persistance,
						description: 'Error at update identity token [updateIdentityToken]'
					})
					reject(error);
					return;
				});
		} catch (err) {
			var error = util.error.api(err, {
				code: util.constants.error.security,
				description: 'Error at update identity token [updateIdentityToken]'
			})
			reject(error);
			return;
		}
	});
}

function findIdentityByInternalUserIdentifier(internalUseId) {
	return new Promise(function (resolve, reject) {
		model.identity.findOne({
			internalUserId: internalUseId,
		}, function (err, identity) {
			if (!err) {
				resolve(identity);
			} else {
				var error = util.error.api(err, {
					code: util.constants.error.data,
					description: 'Identity not found'
				});
				reject(error);
			}

		})
	})
}

function findIdentityById(identityIdentifier) {
	return new Promise(function (resolve, reject) {
		model.identity.findOne({
				_id: identityIdentifier
			},
			function (err, identity) {
				if (!err) {
					console.log('Identity retrieved.');
					resolve(identity);
				} else {
					var error = util.error.api(err, {
						code: util.constants.error.persistance,
						description: 'Error ar find identity by Identifier [findIdentityById].'
					})
					reject(error);
				}
				return;
			});
	});
}

// Contact

function createContact(full_name,
	email,
	phones) {

	return new Promise(function (resolve, reject) {
		var newContact = model.contact({
			_id: mongoose.Types.ObjectId(),
			fullName: full_name,
			email: email,
			phones: phones,
			createdBy: {
				_id: util.constants.appUser,
				on: Date()
			}
		});

		return newContact.save()
			.then(registeredContact => {
				console.log('Contact created.');
				resolve(registeredContact);
				return;
			}, err => {
				var error = util.error.api(error, {
					code: util.constants.error.persistance,
					description: 'Error at create contact [createContact].'
				})
				reject(error);
				return;
			});
	});
}

function updateContact(contact_id,
	full_name,
	email,
	phones,
	country,
	gender,
	picture,
	modifiedBy
) {
	return new Promise(function (resolve, reject) {
		if (!contact_id) {
			var error = util.error.invalidRequest({
				code: util.constants.error.data,
				description: 'The contact identifier [contact_id] is required.'
			});
			reject(error);
			return;
		}

		if (!modifiedBy) {
			var error = util.error.invalidRequest({
				code: util.constants.error.data,
				description: 'The modifier information [modifiedBy] is required.'
			});
			reject(error);
			return;
		}

		findContactById(contact_id).then((contact) => {
			if (contact) {

				contact.fullName = full_name ? full_name : contact.full_name;
				contact.email = email ? email : contact.email;
				contact.phones = phones ? phones : contact.phones;
				contact.country = country ? country : contact.country;
				contact.gender = gender ? gender : contact.gender;
				contact.picture = picture ? picture : contact.picture;

				contact.modifiedBy = {
					_id: modifiedBy._id,
					on: Date()
				};

				return contact.save()
					.then(updatedContact => {
						console.log('Contact updated.');
						resolve(updatedContact);
						return;
					}, err => {
						var error = util.error.api(
							err, {
								code: util.constants.error.persistance,
								description: 'Error at update contact [updatecontact].'
							})
						reject(error);
						return;
					});
			} else {
				var error = util.error.invalidRequest({
					code: util.constants.error.data,
					description: 'Contact not found.'
				})
				reject(error);
				return;
			}

		}).catch((err) => {
			reject(err);
			return;
		})
	})
}

function findContactById(contactIdentifier) {
	return new Promise(function (resolve, reject) {
		model.contact.findOne({
			_id: contactIdentifier
		}, function (err, contact) {
			if (!err) {
				console.log('Contact retrieved.');
				resolve(contact);
			} else {
				var error = util.error.api(err, {
					code: util.constants.error.persistance,
					description: 'Error at find contact by id [findContactById]'
				})
				reject(error);
			}
			return;
		});

	});
}

// User

function createUser(name,
	contactId) {

	return new Promise(function (resolve, reject) {
		var newUser = model.user({
			_id: mongoose.Types.ObjectId(),
			contactId: contactId,
			name: name,
			roles: util.constants.defaults.user.roles,
			createdBy: {
				_id: util.constants.appUser,
				on: Date()
			},
			isActive: false,
			isApproved: false
		});
		return newUser.save()
			.then(registeredUser => {
				console.log('User Created.');
				resolve(registeredUser);
				return;
			}, err => {
				var error = util.error.api({
					code: util.constants.error.persistance,
					description: 'Error ar create user [createUser].'
				})
				reject(err);
				return;
			});
	});
}

function findUserById(userIdentifier) {
	return new Promise(function (resolve, reject) {
		model.user.findOne({
			_id: userIdentifier
		}, function (err, user) {
			if (!err) {
				console.log('User retrieved.')
				resolve(user);
			} else {
				var error = util.error.api(err, {
					code: util.constants.error.persistance,
					description: 'Error at find user by identifier [findUserById].'
				})
				reject(error);
			}
			return;
		});
	});
}

function updateUser(userId, isActive, isApproved, roles, modifiedBy) {

	return new Promise(function (resolve, reject) {

		if (!userId) {
			var error = util.error.invalidRequest({
				code: util.constants.error.data,
				description: 'The user identifier [userId] is required.'
			});
			reject(error);
			return;
		}

		if (!modifiedBy) {
			var error = util.error.invalidRequest({
				code: util.constants.error.data,
				description: 'The modifier information [modifiedBy] is required.'
			});
			reject(error);
			return;
		}

		findUserById(userId).then(retrievedUser => {
			if (retrievedUser) {

				retrievedUser.isActive = isActive ? isActive : retrievedUser.isActive;
				retrievedUser.isApproved = isApproved ? isApproved : retrievedUser.isApproved;
				retrievedUser.roles = roles ? roles : retrievedUser.roles;

				retrievedUser.modifiedBy = {
					_id: modifiedBy._id,
					on: Date()
				};

				return retrievedUser.save()
					.then(updatedUser => {
						console.log('User updated.');
						resolve(updatedUser);
						return;

					}, err => {
						var error = util.error.api(err, {
							code: util.constants.error.persistance,
							description: 'Error at Update User [updateUser].'
						})
						reject(error);
						return;
					})
			} else {
				var err = util.error.invalidRequest({
					code: data,
					description: 'User not found.'
				})
				reject(err);
				return;
			}
			return;
		}).catch(err => {
			reject(err);
			return;
		})
	})


}

function findUserByEmail(email) {
	return new Promise(function (resolve, reject) {
		model.contact.findOne({
			email: email
		}, function (err, contact) {
			if (!err) {
				if (contact) {
					model.user.findOne({
						contactId: contact._id
					}, function (err, user) {
						if (!err) {
							console.log('User retrieved by mail.');
							resolve(user);
						} else {
							var error = util.error.api(err, {
								code: util.constants.error.persistance,
								description: 'Error at find user by email [findUserByEmail].'
							})
							reject(error);
						}
						return;
					});
				} else {
					var error = util.error.generic(409, {
						code: data,
						description: 'User not found.'
					});
					reject(error);
					return;
				}
			} else {
				var error = util.error.api(err, {
					code: util.constants.error.persistance,
					description: 'Error at find user by email [findUserByEmail].'
				})
				reject(error);
				return;
			}
		});
	});
}

// Credentials

function createCredential(
	login,
	password,
	identityId) {

	return new Promise(function (resolve, reject) {

		if (!login) {
			var error = util.error.invalidRequest({
				code: util.constants.error.data,
				description: 'The login [login] is required.'
			});
			reject(error);
			return;
		}

		if (!password) {
			var error = util.error.invalidRequest({
				code: util.constants.error.data,
				description: 'The password [password] is required.'
			});
			reject(error);
			return;
		}

		if (!identityId) {
			var error = util.error.invalidRequest({
				code: util.constants.error.data,
				description: 'The identity identifier [identityId] is required.'
			});
			reject(error);
			return;
		}


		var credential = model.credential({
			_id: mongoose.Types.ObjectId(),
			login: login,
			password: password,
			isActive: true,
			identityId: identityId,
			createdBy: {
				_id: util.constants.appUser,
				on: Date()
			}
		});

		return credential.save()
			.then(registeredCredential => {
				console.log('Credential created.')
				resolve(registeredCredential);
				return;
			}, err => {
				var error = util.error.api(err, {
					code: util.constants.error.persistance,
					description: 'Error at Create Credential [createCredential].'
				})
				reject(error);
				return;
			});
	});
}

function findCredential(login, password) {
	return new Promise(function (resolve, reject) {

		if (!login) {
			var error = util.error.invalidRequest({
				code: util.constants.error.data,
				description: 'The login [login] is required.'
			});
			reject(error);
			return;
		}

		if (!password) {
			var error = util.error.invalidRequest({
				code: util.constants.error.data,
				description: 'The password [password] is required.'
			});
			reject(error);
			return;
		}

		model.credential.findOne({
			login: login
		}, function (err, credential) {
			if (!err) {
				if (credential) {
					if (credential.password == password) {
						console.log('Credential retrieved.');
						resolve(credential);
					} else {
						var error = util.error.invalidRequest({
							code: util.constants.error.data,
							description: 'Invalid password.'
						});
						reject(error);
					}
					return;
				} else {
					var error = util.error.invalidRequest({
						code: util.constants.error.data,
						description: 'Invalid login.'
					});
					reject(error);
					return;
				}
			} else {
				var error = util.error.api(err, {
					code: util.constants.error.persistance,
					description: 'Error at find credentials.'
				})
				reject(error);
				return;
			}
		});

	});
}

module.exports = {
	checkForPendingActivation: checkForPendingActivation,
	signIn: signIn,
	authenticateWithProvider: authenticateWithProvider,
	validateToken: validateToken,
	user: {
		findByEmail: findUserByEmail,
		findById: findUserById,
		update: updateUser
	},
	contact: {
		findById: findContactById,
		update: updateContact
	},
	credential: {
		find: findCredential
	},
	identity: {
		findByInternalUserId: findIdentityByInternalUserIdentifier,
		findById: findIdentityById,
		regenerateToken: updateIdentityToken
	}
}