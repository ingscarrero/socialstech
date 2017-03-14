'use strict';
var authorization = require('../server/shared/authorization');
var securityDomain = require('../server/domain/securityDomain');
var siteDomain = require('../server/domain/siteDomain');
var express = require('express');
var router = express.Router();
var request = require("request");
var util = require('../server/shared/util');

router.put('/:user_id',
	authorization.ensureSecure,
	authorization.isAuthorized,
	authorization.isAuthenticated,
	function (req, res, next) {

		var user_id = req.params.user_id;
		var contact = req.body;


		securityDomain.contact.update(
			contact._id,
			contact.fullName,
			contact.email,
			contact.phones,
			contact.country,
			contact.gender,
			contact.picture,
			contact.modifiedBy
		).then((updatedContact) => {
			securityDomain.checkForPendingActivation(user_id)
				.then(hasPendingActivation => {
					if (hasPendingActivation) {
						var protocol = 'https://';
						var activationPath = '/#!/account/activate'
						var activationUrl = protocol + req.get('host') + activationPath;

						siteDomain.activation.sendMail(activationUrl, user_id, updatedContact.email)
							.then(mail => {

								console.log('Activation Mail Sended.');

								var messageText = 'Your demographics information was updated succesfully. But there is one more pending step. ' +
									'We have sended a mail to the address [' + mail.to +
									'] with the required procedure.' +
									'Please check your mail to activate your account.';

								message = {
									code: 0,
									message: 'Demographics Update completed.',
									data: messageText
								}
								res.status(200).jsonp(message);
							}).catch(err => {
								next(err);
							})
					} else {
						var messageText = 'Your demographics information was updated succesfully.';

						var message = {
							code: 0,
							message: 'Demographics Update completed.',
							data: messageText
						}
						res.status(200).jsonp(message);
					}
				}).catch(err => {
					next(err);
				})
		}).catch((err) => {
			next(err);
		});
	});



module.exports = router;