var mongoose = require('mongoose');
console.log('Will connect to security model.');
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
	}))
}