
require('./response_extension');
var securityDomain = require('../domain/securityDomain');
var express = require('express');


// Classes
class Authorization{
	constructor(key) {
		this.type = "Unknown"
		this.key = key
	}
} 

class BasicAuthorization extends Authorization{
 	constructor(key){
		super(key)
		var decodedKey = Base64.decode(key)
		var credentials = token.split(":")
		this.type = "Basic"
		this.login = credentials[0]
		this.password = credentials[1]
	}
}

class BearerAuthorization extends Authorization {
	constructor(key){
		super(key)
		this.type = "Bearer"
	}
}

// Methods
function extractRequestCredentials (authentication){
	var authorizationComponents = authentication.split(" ")
	var result = {}
	switch(authorizationComponents[0]){
		case "Basic":
			var result = new BasicAuthorization(authorizationComponents[1])
			break;
		case "Bearer":
			var result = new BearerAuthorization(authorizationComponents[1])
			break;
		default:
			break;
	}
	return result
}

function ensureAuthorized(req, res, next) {
    var header = req.headers.authorization;
    if (typeof header !== 'undefined') {
        var authorization = extractRequestCredentials(header);
        req.token = authorization.key;
        next();
    } else {
        res.error(404, 
        	"Invalid token.", 
        	"Bearer Token invalid or missing.");
    }
}

function ensureIsAuthenticated(req, res, next){
	securityDomain.validateToken('local', req.token)
		.then(function(profile){
			securityDomain.user.findById(profile.id)
				.then(function(user){
					securityDomain.contact.findById()
						.then(function(contact){
							req.identityInformation = {
								user: user,
								contact: contact
							};
							next();
						}).catch(err=>{
							securityDomain.handleError(err, res);	
						});
				}).catch(err=>{
					securityDomain.handleError(err, res);	
				});
		})
		.catch(err=>{
			securityDomain.handleError(err, res);
		});
};


module.exports = {
	credentials: extractRequestCredentials,
	isAuthorized: ensureAuthorized,
	isAuthenticated: ensureIsAuthenticated
}