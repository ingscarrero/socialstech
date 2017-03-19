'use strict';
var mongoose = require('mongoose');
var mongodbUri = require('mongodb-uri');
var dbUri = 'mongodb://socialstech:G5XsQwD0wzdZz4ox@cluster0-shard-00-00-z6umu.mongodb.net:27017,cluster0-shard-00-01-z6umu.mongodb.net:27017,cluster0-shard-00-02-z6umu.mongodb.net:27017/security?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin'; //process.env.MONGO_DB_SECURITY);
var options = {
	replset: {
		rs_name: 'Cluster0-shard-0'
	}
}
console.log('Will connect to security model at: ' + dbUri);
var connection = mongoose.createConnection(dbUri, options);
var Schema = mongoose.Schema;

module.exports = {
	credential: connection.model('credential', new Schema({
		_id: String,
		login: String,
		password: String,
		isActive: Boolean,
		identityId: String,
		createdBy: {
			_id: String,
			on: Date
		},
		modifiedBy: {
			_id: String,
			on: Date
		}
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
		},
		modifiedBy: {
			_id: String,
			on: Date
		}
	})),
	user: connection.model('user', new Schema({
		_id: String,
		name: String,
		contactId: String,
		roles: [],
		isApproved: Boolean,
		isActive: Boolean,
		createdBy: {
			_id: String,
			on: Date
		},
		modifiedBy: {
			_id: String,
			on: Date
		}
	})),
	contact: connection.model('contact', new Schema({
		_id: String,
		fullName: String,
		email: String,
		phones: {
			home: String,
			office: String,
			mobile: String
		},
		gender: String,
		picture: String,
		country: {
			_id: String,
			name: String
		},
		createdBy: {
			_id: String,
			on: Date
		},
		modifiedBy: {
			_id: String,
			on: Date
		}
	})),
	role: connection.model('role', new Schema({
		_id: String,
		name: String,
		isActive: Boolean,
		createdBy: {
			_id: String,
			on: Date
		},
		modifiedBy: {
			_id: String,
			on: Date
		}
	}))
}