// siteDomain.js
var express = require('express');
var mongoose = require('mongoose');
var model = require('../model/socialstechnologies');
var supportEmail = 'support@socialstechnologies.com';
function createInteraction(interaction){
	return new Promise(function(resolve,reject){
		try{
			var newInteraction = model.interaction({
				_id: mongoose.Types.ObjectId(),
				createdBy: {
					customer: {
						name: interaction.name,
						email: interaction.email
					}, 
					on: Date()
				},
				subject: interaction.subject,
				type: 'ContactRequest',
				details: interaction.details,
				status: 'Created'
			})
			newInteraction.save(function(err, registeredInteraction){
				if (!err) {
					resolve(registeredInteraction)
				} else {
					reject(createError(err))
				}
			})
		} catch (ex){
			console.log(ex)
			reject(createError(ex))
		}
	})
}

function createError(errorInformation){
	var error = {
		code: 500,
		message: 'Ops! I\'m afraid to tell you something went wrong. Please try again. If the problem persists report the issue via <a href="mailto:' + supportEmail + '"><strong>mail</strong></a>.',
		error: { data: errorInformation.toString() }
	}
	return error
}

module.exports = {
	interaction:{
		new: createInteraction
	}
}