var auth = require('../config/auth');
var mongoose = require('mongoose');
console.log('Will connect to security model.');
var connection = mongoose.createConnection(auth.localAuth.database);
var Schema = mongoose.Schema;

module.exports = {
	credential:  connection.model('credential', new Schema({
		_id: String,
		login: String,
		password: String,
		createdBy: {
			_id: String,
			on: Date
		},
		isActive: Boolean,
		identityId: String
	})),
	identity: connection.model('identity', new Schema({
		_id: String,
		type: String,
		token: String,
		externalUserId: String,
		internalUserId: String,
		createdBy: {
			_id: String,
			on: Date
		}
	})),
	user:  connection.model('user', new Schema({
		_id: String,
		name: String,
		contactId: String,
		roles: [],
		createdBy: {
			_id: String,
			on: Date
		},
	})),
	contact:  connection.model('contact', new Schema({
		_id: String,
		fullName: String,
		email: String,
		phones: {
			home: String,
			office: String,
			mobile: String
		}, 
		gender: String,
		picture: String
	})),
	role: connection.model('role', new Schema({
		_id: String,
		name: String,
		isActive: Boolean,
		createdBy: {
			_id: String,
			on: Date
		}
	}))
}