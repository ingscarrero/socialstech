'use strict';
var sstService = angular.module('sstService', ['ngResource']);

sstService.factory('Content', function ($resource, $q, identity) {
	var content = {}

	content.confirmation = function (confirmationName) {
		var contentProvider = $resource(
			'/api/sst/content/:confirmation',
			null, {
				content: {
					method: 'GET',
					isArray: false
				}
			}
		)

		return $q(function (resolve, reject) {
			contentProvider.content({
					confirmation: confirmationName
				}).$promise
				.then(function (response) {
					resolve(response.data)
					return;
				}).catch(function (error) {
					console.log(error)
					reject(error)
					return;
				})
		})
	}

	content.home = function () {
		var contentProvider = $resource(
			'/api/sst/content/Home',
			null, {
				content: {
					method: 'GET',
					isArray: false
				}
			}
		)

		return $q(function (resolve, reject) {
			contentProvider.content().$promise
				.then(function (response) {
					resolve(response.data)
					return;
				}).catch(function (error) {
					console.log(error)
					reject(error)
					return;
				})
		})
	}

	content.setHome = function (content) {
		var contentProvider = $resource(
			'/api/sst/content/',
			null, {
				content: {
					method: 'POST',
					isArray: false,
					headers: {
						'Authorization': 'Bearer ' + identity.token.get().token
					}
				}
			}
		)

		content.name = 'Home'

		return $q(function (resolve, reject) {
			contentProvider.content(content).$promise
				.then(function (response) {
					resolve(response.data)
					return;
				}).catch(function (error) {
					console.log(error)
					reject(error)
					return;
				})
		})
	}

	content.about = function () {
		var contentProvider = $resource(
			'/api/sst/content/About',
			null, {
				content: {
					method: 'GET',
					isArray: false
				}
			}
		)

		return $q(function (resolve, reject) {
			contentProvider.content().$promise
				.then(function (response) {
					resolve(response.data)
					return;
				}).catch(function (error) {
					console.log(error)
					reject(error)
					return;
				})
		})
	}

	content.setAbout = function (content) {
		var contentProvider = $resource(
			'/api/sst/content/',
			null, {
				content: {
					method: 'POST',
					isArray: false,
					headers: {
						'Authorization': 'Bearer ' + identity.token.get().token
					}
				}
			}
		)

		content.name = 'About'

		return $q(function (resolve, reject) {
			contentProvider.content(content).$promise
				.then(function (response) {
					resolve(response.data)
					return;
				}).catch(function (error) {
					console.log(error)
					reject(error)
					return;
				})
		})
	}

	return content;
})

sstService.factory('Demographic', function ($resource, $q, identity) {
	var demographics = {}

	demographics.getByUserId = function (user_id) {

		var demographicsProvider = $resource(
			'/api/sst/demographics/:user_id', null, {
				get: {
					method: 'GET',
					isArray: false,
					headers: {
						'Authorization': 'Bearer ' + identity.token.get().token
					}
				}
			})

		return $q(function (resolve, reject) {
			demographicsProvider.get({
				user_id: user_id
			}).$promise.then((response) => {
				resolve(response.data);
				return;
			}).catch((error) => {
				console.log(error)
				reject(error)
				return;
			});
		});
	}

	demographics.update = function (user_id, demographics) {

		var demographicsProvider = $resource(
			'/api/sst/demographics/:user_id', null, {
				update: {
					method: 'PUT',
					isArray: false,
					headers: {
						'Authorization': 'Bearer ' + identity.token.get().token
					}
				}
			})

		return $q(function (resolve, reject) {
			demographicsProvider.update({
					user_id: user_id
				},
				demographics
			).$promise.then((response) => {
				resolve(response.data);
				return;
			}).catch((error) => {
				console.log(error)
				reject(error)
				return;
			});
		});
	}

	return demographics;
})

sstService.factory('Request', function ($resource, $q, identity) {
	var request = {};

	request.retrieveRequest = function (requestId) {
		var requestProvicer = $resource(
			'/api/sst/request/:request_id', null, {
				get: {
					method: 'GET',
					isArray: false,
					headers: {
						'Authorization': 'Bearer ' + identity.token.get().token
					}
				}
			});

		return $q(function (resolve, reject) {
			requestProvicer.get({
				request_id: requestId
			}).$promise.then((response) => {
				resolve(response.data);
				return;
			}).catch((error) => {
				console.log(error)
				reject(error)
				return;
			});
		});

	}

	return request;
})

sstService.factory('Auth', function ($resource, $q, identity) {

	var auth = {}

	auth.isResourceAllowed = function (view) {

		return new Promise(function (resolve, reject) {
			if (!view.requiresAuthentication) {
				resolve(true)
				return;
			} else if (!auth.isLoggendIn()) {
				resolve(false)
				return;
			} else if (!view.permissions || !view.permissions.length) {
				resolve(true)
				return;
			} else {
				auth.isIdentityAllowed(view.permissions)
					.then((result) => {
						resolve(result)
						return;
					}).catch((err) => {
						reject(err)
						return;
					})
			}

		})
	}

	auth.isIdentityAllowed = function (permissions) {
		return new Promise(function (resolve, reject) {
			var validPermission = false
			auth.currentIdentity().then(function (result) {
				var roles = result.user.roles
				angular.forEach(permissions, function (permission, index) {
					validPermission = roles.indexOf(permission) >= 0
					if (validPermission) {
						return
					}
				})
				resolve(validPermission)
				return;
			}, function (error) {
				console.log(error)
				reject(error)
				return;
			})
		})
	}

	auth.isLoggendIn = function () {
		var token = identity.token.get()
		var exprationTimeout = 3600000 //51200
		if (!token) {
			return false;
		}

		var expiresAt = new Date(token.issuedOn).getTime() + exprationTimeout
		var now = Date.now()
		return token && expiresAt > now;
	}

	auth.currentIdentity = function () {

		var securityProvider = $resource(
			'/api/sst/security/profile',
			null, {
				profile: {
					method: 'GET',
					isArray: false,
					headers: identity.token.get() ? {
						'Authorization': 'Bearer ' + identity.token.get().token
					} : undefined
				}
			})

		return $q(function (resolve, reject) {
			if (!auth.isLoggendIn()) {
				var error = {
					code: 400,
					message: 'It isn\'t possible to retrieve profile information.',
					data: {
						code: -1,
						error: 'User is not authenticated or has an invalid token.'
					}
				}
				reject(error);
				return
			}
			securityProvider.profile()
				.$promise.then(function (response) {
					resolve(response.data)
					return;
				}, function (error) {
					console.log(error)
					reject(error)
					return;
				})
		})
	}

	auth.logOut = function () {
		identity.token.set(undefined)
		return;
	}

	auth.logIn = function (username, password) {

		var securityProvider = $resource(
			'/api/sst/security/login',
			null, {
				login: {
					method: 'POST',
					isArray: false
				}
			})

		return $q(function (resolve, reject) {
			securityProvider.login({
				login: username,
				password: password
			}).$promise.then(function (response) {
				identity.token.set(response.data)
				resolve(response.data);
				return;
			}, function (error) {
				console.log(error)
				reject(error);
				return;
			})
		})
	}

	auth.signIn = function (username, password) {
		var securityProvider = $resource(
			'/api/sst/security/signin',
			null, {
				signin: {
					method: 'POST',
					isArray: false
				}
			})
		return $q(function (resolve, reject) {
			securityProvider.signin({
				login: username,
				password: password
			}).$promise.then(function (response) {
				identity.token.set(response.data)
				resolve(response.data);
				return;
			}, function (error) {
				console.log(error)
				reject(error)
				return;
			})
		})
	}

	auth.activateAccount = function (requestId) {
		var securityProvider = $resource(
			'/api/sst/security/account/activate/:request_id',
			null, {
				activate: {
					method: 'PUT',
					isArray: false
				}
			})
		return $q(function (resolve, reject) {
			securityProvider.activate({
					request_id: requestId
				},
				undefined
			).$promise.then(function (response) {
				resolve(response.data);
				return;
			}, function (error) {
				console.log(error);
				reject(error);
				return;
			})
		})
	}

	auth.submitElevationRequest = function (elevationRequest) {
		var securityProvider = $resource(
			'/api/sst/security/account/elevate/request/:user_id', null, {
				elevate: {
					method: 'PUT',
					isArray: false,
					headers: {
						'Authorization': 'Bearer ' + identity.token.get().token
					}
				}
			})

		return $q(function (resolve, reject) {
			securityProvider.elevate({
					user_id: elevationRequest.from
				},
				elevationRequest
			).$promise.then((response) => {
				resolve(response.data);
				return;
			}).catch((error) => {
				console.log(error)
				reject(error)
				return;
			});
		});
	}

	auth.resolveElevationRequest = function (requestId, action) {
		var securityProvider = $resource(
			'/api/sst/security/account/elevate/:request_id/process/:action', null, {
				processElevationRequest: {
					method: 'PUT',
					isArray: false,
					headers: {
						'Authorization': 'Bearer ' + identity.token.get().token
					}
				}
			})

		return $q(function (resolve, reject) {
			securityProvider.processElevationRequest({
					request_id: requestId,
					action: action
				},
				undefined
			).$promise.then((response) => {
				resolve(response.data);
				return;
			}).catch((error) => {
				console.log(error)
				reject(error)
				return;
			});
		});
	}

	return auth;
})