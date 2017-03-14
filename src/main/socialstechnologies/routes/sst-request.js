'use strict';
var authorization = require('../server/shared/authorization');
var express = require('express');
var util = require('../server/shared/util');
var router = express.Router();
var domain = require('../server/domain/siteDomain');

router.get('/:requestId',
    authorization.ensureSecure,
    authorization.isAuthorized,
    authorization.isAuthenticated,
    function (req, res, next) {
        var requestId = req.params.requestId;
        domain.request.findById(requestId)
            .then((request) => {
                if (request) {
                    var message = {
                        code: 0,
                        message: 'The request was retrieved successfully.',
                        data: request
                    }
                    res.status(200).jsonp(message);
                } else {
                    var message = {
                        code: 0,
                        message: 'There were no matches for the given criteria.',
                        data: undefined
                    }
                    res.status(409).jsonp(message);
                }

            }).catch((err) => {
                next(err);
            })
    })

module.exports = router;