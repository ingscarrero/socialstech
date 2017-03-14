'use strict';
var authorization = require('../server/shared/authorization');
var securityDomain = require('../server/domain/securityDomain');
var siteDomain = require('../server/domain/siteDomain');
var express = require('express');
var router = express.Router();
var request = require("request");
var util = require('../server/shared/util');

router.put('/account/elevate/:request_id/process/:action',
	authorization.ensureSecure,
	authorization.isAuthorized,
	authorization.isAuthenticated,
	function (req, res, next) {


		var requestId = req.params.request_id;
		var action = req.params.action;

		var elevationRequestUser;
		var elevationRequestContact;
		var elevationRequest;


		siteDomain.request.findById(
			requestId
		).then(retrievedElevationRequest => {
			if (retrievedElevationRequest &&
				retrievedElevationRequest.type === util.constants.request.types.elevation) {

				elevationRequest = retrievedElevationRequest;

				return securityDomain.user.findById(elevationRequest.from);
			} else {
				var error = util.error.generic(400, {
					code: util.constants.error.data,
					description: 'Request Not Found'
				});
				next(error);
				return;
			}
		}).then(user => {
			if (user) {
				elevationRequestUser = user;
				return securityDomain.contact.findById(elevationRequestUser.contactId);
			} else {
				var error = util.error.generic(400, {
					code: util.constants.error.data,
					description: 'Request\'s User Not Found'
				});
				next(error);
			}
		}).then(contact => {
			if (contact) {
				elevationRequestContact = contact;
				var adminRole = 'admin';
				elevationRequestUser.roles.push(adminRole);

				return securityDomain.user.update(
					elevationRequestUser._id,
					elevationRequestUser.isActive, elevationRequestUser.isApproved, elevationRequestUser.roles, {
						_id: elevationRequestUser._id
					});

			} else {
				var error = util.error.generic(400, {
					code: util.constants.error.data,
					description: 'Request\'s Contact Not Found'
				});
				next(error);
				return;
			}
		}).then(updatedUser => {
			return siteDomain.profileElevation.processRequest(
				action,
				elevationRequest,
				req.identityInformation.user._id
			)
		}).then(processedRequest => {
			var elevationResult =
				action === util.constants.security.profileElevation.actions.approve ?
				'APPROVED. Please proceed to the Social Solutions Technologies Web Site to valite the result.' :
				'REJECTED';
			return siteDomain.profileElevation.notifyRequestProcess(elevationRequestContact, elevationResult)
		}).then(mail => {
			var message = {
				code: 0,
				message: 'Elevation request processed.',
				data: 'The account elevation for the user ' + elevationRequestContact.fullName + ' has been fulfilled. A mail to notify the result has been sended to the mail ' + mail.from + '.'
			}
			res.status(200).jsonp(message);
		}).catch(err => {
			next(err);
		})
	})

router.put('/account/elevate/request/:user_id',
	authorization.ensureSecure,
	authorization.isAuthorized,
	authorization.isAuthenticated,

	function (req, res, next) {
		var user_id = req.params.user_id;
		var requestInformation = req.body;
		var requestUser = {};
		var requestContact = {}

		securityDomain.user.findById(user_id).then(user => {
			if (user) {
				requestUser = user;
				return securityDomain.contact.findById(user.contactId);
			} else {
				var error = util.error.generic(400, {
					code: util.constants.error.data,
					description: 'Request\'s User Not Found'
				});
				next(err);
			}
		}).then(contact => {
			if (contact) {
				requestContact = contact;
				return siteDomain.profileElevation.request(
					requestUser._id,
					requestInformation,
					requestContact
				);
			} else {
				var error = util.error.generic(400, {
					code: util.constants.error.data,
					description: 'Request\'s Contact Not Found'
				});
				next(err);
			}
		}).then(generatedRequest => {
			var protocol = 'https://';
			var elevationPath = '/#!/account/elevate'
			var elevationUrl = protocol + req.get('host') + elevationPath;

			return siteDomain.profileElevation.nofityRequest(
				elevationUrl,
				generatedRequest,
				requestContact
			)

		}).then(mail => {
			var messageText = 'Your request has been processed. It will be reviewed. After the revision is complete, you will get a mail with the corresponding result.';

			var message = {
				code: 0,
				message: 'Elevation request generated',
				data: messageText
			}
			res.status(200).jsonp(message);
		}).catch(err => {
			next(err);
		});
	});

router.put('/account/activate/:request_id',
	authorization.ensureSecure,
	function (req, res, next) {

		var requestId = req.params.request_id;

		siteDomain.activation.activate(requestId)
			.then(activatedUser => {
				var message = {
					code: 0,
					message: 'Your account was activated succesfully',
					data: activatedUser
				}
				res.status(200).jsonp(message);
			}).catch(err => {
				next(err);
			})
	});

router.post('/signin',
	authorization.ensureSecure,
	function (req, res, next) {
		securityDomain.signIn(req.body.login,
			req.body.password).then(function (identity) {

			var identityInformation = {
				token: identity.token,
				issuedOn: identity.createdBy.on
			};

			var message = {
				code: 0,
				message: 'Your account was created succesfully',
				data: identityInformation
			}
			res.status(200).jsonp(message);

		}).catch(err => {
			next(err);
		});
	});

router.post('/login',
	authorization.ensureSecure,
	function (req, res, next) {

		var authenticatedIdentity;

		securityDomain.credential.find(
				req.body.login,
				req.body.password
			).then(function (credential) {
				if (credential) {
					if (credential.isActive) {
						return securityDomain.identity.findById(credential.identityId);
					} else {
						var error = util.error.generic(400, {
							code: util.constants.error.data,
							description: 'Invalid credential.'
						})
						next(error);
					}
				} else {

					var error = util.error.generic(400, {
						code: util.constants.error.data,
						description: 'Invalid login or password.'
					})
					next(error);
				}
			}).then(function (identity) {
				authenticatedIdentity = identity;
				if (identity) {
					return securityDomain.authenticateWithProvider(
						'local',
						identity.token
					);
				} else {
					var error = util.error.generic(400, {
						code: util.constants.error.data,
						description: 'Identity not found.'
					})
					next(error);
				}
			}).then(function (identity) {
				return securityDomain.user.findById(identity.internalUserId);
			}).then(user => {
				if (user) {
					if (user.isActive && user.isApproved) {
						var identityInformation = {
							token: authenticatedIdentity.token,
							issuedOn: authenticatedIdentity.createdBy.on
						};

						var message = {
							code: 0,
							message: "Identity was successfully authenticated.",
							data: identityInformation
						}
						res.status(200).jsonp(message);
					} else {

						var error = util.error.generic(409, {
							code: util.constants.error.data,
							description: 'Ups! You need to activate your account first. Check your mail.'
						})
						next(error);
					}
				} else {
					var error = util.error.generic(409, {
						code: util.constants.error.data,
						description: 'User not found.'
					})
					next(error);
				}
			})
			.catch(err => {
				if (err.code == util.constants.error.expired) {
					securityDomain.identity.regenerateToken(
							authenticatedIdentity
						).then(identity => {
							return securityDomain.user.findById(identity.internalUserId)
						}).then(user => {
							if (user) {
								if (user.isActive && user.isApproved) {
									var identityInformation = {
										token: authenticatedIdentity.token,
										issuedOn: authenticatedIdentity.createdBy.on
									};

									var message = {
										code: 0,
										message: "Identity was successfully authenticated.",
										data: identityInformation
									}
									res.status(200).jsonp(message);
								} else {

									var error = util.error.generic(409, {
										code: util.constants.error.data,
										description: 'Ups! You need to activate your account first. Check your mail.'
									})
									next(error);
								}
							} else {
								var error = util.error.generic(409, {
									code: util.constants.error.data,
									description: 'User not found.'
								})
								next(error);
							}
						})
						.catch(err => {
							next(err);
						});
				} else {
					next(err);
				}
			});
	});

router.get('/profile',
	authorization.ensureSecure,
	authorization.isAuthorized,
	authorization.isAuthenticated,
	function (req, res, next) {
		var message = {
			code: 0,
			message: "Identity was successfully authenticated.",
			data: req.identityInformation
		}
		res.status(200).jsonp(message);
	});

module.exports = router;