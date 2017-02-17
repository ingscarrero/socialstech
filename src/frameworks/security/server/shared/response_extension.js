var express = require("express");

if (!express.response.error) {
	express.response.error = function(statusCode, message, error){
		this.statusCode = statusCode;
		var body = {
			code: -1,
			message: message,
			error: error
		}
		this.setHeader('Content-Type', 'application/json');
		this.write(JSON.stringify(body));
		this.end();
	},
	express.response.json = function(statusCode, data, message){
		this.statusCode = statusCode;
		var body = {
			code: 0,
			data: data,
			message: message
		}
		this.setHeader('Content-Type', 'application/json');
		this.write(JSON.stringify(body));
		this.end();
	}
}
