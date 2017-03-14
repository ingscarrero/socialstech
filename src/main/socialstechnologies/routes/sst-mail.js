'use strict';
var authorization = require('../server/shared/authorization');
var express = require('express');
var router = express.Router();
var domain = require('../server/domain/siteDomain');
var util = require('../server/shared/util');
/* GET home page. */
router.get('/:year/:month/:day',
	function (req, res, next) {
		var year = req.params.year,
			month = req.params.month,
			day = req.params.day;

		var filterObject = req.query

		domain.mail.read({
			period: {
				year: year,
				month: month,
				day: day
			},
			filter: filterOrbject
		}).then(function (mails) {
			var message = {
				code: 0,
				message: 'SST Mails were retrieved successfully',
				data: content
			}
			res.status(200).jsonp(message)
		}).catch(err => {
			next(err);
		});
	});

router.post('/',
	authorization.ensureSecure,
	authorization.isAuthorized,
	authorization.isAuthenticated,
	function (req, res, next) {
		var mail = req.body
		console.log(mail)
		domain.mail.send(mail).then(function (result) {
			var message = {
				code: 0,
				message: 'SST Mail was sended successfully',
				data: result
			}
			res.status(200).jsonp(message)
		}).catch(err => {
			next(err);
		})
	});

module.exports = router;