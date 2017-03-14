'use strict';
var express = require('express');

var utilsModule = function () {

    var utils = {
        error: {
            api: generateAPIError,
            invalidRequest: generateRequestError,
            generic: generateError
        },
        constants: {
            supportmail: 'scarrero@socialstecnologies.com',
            appUser: 'WEB_APP',
            authentication: {
                local: 'local'
            },
            arguments: {
                createIdentity: {
                    type: 0,
                    provider: 0,
                    login: 1,
                    password: 2,
                    profile: 1,
                    userId: 2
                }
            },
            error: {
                persistance: 100,
                data: 101,
                security: 102,
                externalProvider: 103,
                expired: 104
            },
            request: {
                defaultStatus: 'created',
                fulfillmentStatus: 'fulfilled',
                invalidUpdateStatus: [
                    'fulfilled', 'cancelled', 'denied'
                ],
                types: {
                    activation: 'ACTIV',
                    elevation: 'ELVT'
                }
            },
            security: {
                profileElevation: {
                    approverMail: 'scarrero@socialstechnologies.com',
                    actions: {
                        approve: 'approve',
                        reject: 'deny'
                    }
                }
            },
            mail: {
                sender: 'scarrero@socialstechnologies.com',
                initialStatus: 'scheduled',
                failureStatus: 'pending'
            },
            defaults: {
                user: {
                    roles: ['user']
                }
            }
        }
    }

    function generateAPIError(baseError, errorInformation) {
        console.log(baseError);
        var error = {
            status: 500,
            code: errorInformation.code,
            message: 'Ops! I\'m afraid to tell you something went wrong. Please try again. If the problem persists report the issue via <a href="mailto:' + constants.supportmail + '"><strong>mail</strong></a>.',
            error: errorInformation.description
        }
        return error;
    }

    function generateRequestError(errorInformation) {
        console.log('Invalid request. ' + errorInformation.description);
        var error = {
            status: 400,
            code: errorInformation.code,
            message: 'Ops! I\'m afraid to tell your request cannot be processed. Please validate the request\'s submmited information and try again.',
            error: errorInformation.description
        }

        var x = Error
        return error;
    }

    function generateError(status, errorInformation) {
        console.log('Invalid request. ' + errorInformation.description);
        var error = {
            status: status,
            code: errorInformation.code,
            message: 'Ops! I\'m afraid to tell you there were validations problems with the submitted information. Please review the error details and try again.',
            error: errorInformation
        }
        return error;
    }

    return utils;
}

module.exports = utilsModule();