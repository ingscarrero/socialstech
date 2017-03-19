'use strict';
var mongoose = require('mongoose');
var mongodbUri = require('mongodb-uri');
var dbUri = 'mongodb://socialstech:G5XsQwD0wzdZz4ox@cluster0-shard-00-00-z6umu.mongodb.net:27017,cluster0-shard-00-01-z6umu.mongodb.net:27017,cluster0-shard-00-02-z6umu.mongodb.net:27017/socialstechnologies?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin'; //process.env.MONGO_DB_BDOMAIN);
var options = {
	db: {
		native_parser: true
	},
	server: {
		poolSize: 5
	},
	replset: {
		rs_name: 'Cluster0-shard-0'
	}
}
console.log('Will connect to business model at:' + dbUri);
var connection = mongoose.createConnection(dbUri, options);
var Schema = mongoose.Schema;

module.exports = {
	interaction: connection.model('interaction', new Schema({
		_id: String,
		type: String,
		createdBy: {
			customer: {
				name: String,
				email: String
			},
			on: Date
		},
		subject: String,
		details: String,
		status: String
	})),
	content: connection.model('content', new Schema({
		_id: String,
		name: String,
		createdBy: {
			_id: String,
			on: Date
		},
		modifiedBy: {
			_id: String,
			on: Date
		},
		isActive: Boolean,
		items: Array
	})),
	request: connection.model('request', new Schema({
		_id: String,
		type: String,
		from: String,
		details: Array,
		status: String,
		createdBy: {
			_id: String,
			on: Date
		},
		modifiedBy: {
			_id: String,
			on: Date
		},
		parent: String,
		linkedRequest: Array,
		category: String,
		subCategory: String
	})),
	mail: connection.model('mail', new Schema({
		_id: String,
		createdBy: {
			_id: String,
			on: Date
		},
		modifiedBy: {
			_id: String,
			on: Date
		},
		status: String,
		from: String,
		to: String,
		subject: String,
		text: String,
		html: String,
		service: String,
		status: String,
		error: String
	}))
}