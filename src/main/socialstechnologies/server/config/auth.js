module.exports = {
	facebookAuth:{
		"clientID":"your-client-id",
		"clientSecret":"your-client-secret",
		"callbackURL":"http://localhost:3000/security/auth/facebook",
		"issuer":"APP_NAME",
	},
	twitterAuth:{
		"consumerKey":"",
		"consumerSecret":"",
		"callbackURL":"http://localhost:3000/security/auth/twitter",
		"issuer":"APP_NAME",
	},
	googleAuth:{
		"clientID":"",
		"clientSecret":"",
		"callbackURL":"http://localhost:3000/security/auth/google",
		"issuer":"APP_NAME",
	}, 
	localAuth:{
		"secret":"your-app-secret",
		"database":"mongodb://userQBD:uLTwAk2BiMENDcW1@172.30.220.178:27017/security",
		"issuer":"APP_NAME",
		"expiration":1440
	}
}