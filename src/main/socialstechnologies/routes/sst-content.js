'use strict';
var authorization = require('../server/shared/authorization');
var express = require('express');
var router = express.Router();
var domain = require('../server/domain/siteDomain');
var util = require('../server/shared/util');

/* GET home page. */
router.get('/:name',
	function (req, res, next) {

		var contentName = req.params.name;

		domain.content.read(contentName).then(function (content) {
			var message = {
				code: 0,
				message: 'SST Contents were retrieved successfully',
				data: content
			}
			res.status(200).jsonp(message)
		}).catch(err => {
			next(err);
		})
	});

router.post('/',
	authorization.ensureSecure,
	authorization.isAuthorized,
	authorization.isAuthenticated,
	function (req, res, next) {

		var content = req.body

		domain.content.set(content).then(function (content) {
			var message = {
				code: 0,
				message: 'SST Contents was submmited successfully',
				data: content
			}
			res.status(200).jsonp(message);

		}).catch(err => {
			next(err);
		})
	});

module.exports = router;