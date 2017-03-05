var mongoose = require('mongoose');
console.log('Will connect to business model at:' + process.env.MONGO_DB_BDOMAIN);
var connection = mongoose.createConnection(process.env.MONGO_DB_BDOMAIN);
var Schema = mongoose.Schema;

module.exports = {
	interaction:  connection.model('interaction', new Schema({
		_id: String,
		type: String,
		createdBy:{
			customer:{
				name: String,
				email: String
			}, on: Date
		},
		subject:String,
		details:String,
		status:String
	})),
	content: connection.model('content', new Schema({
		_id: String,
		name: String, 
		createdBy:{
			_id: String,
			on: Date
		},
		modifiedBy:{
			_id: String,
			on: Date
		},
		isActive: Boolean,
		items: Array
	}))
}