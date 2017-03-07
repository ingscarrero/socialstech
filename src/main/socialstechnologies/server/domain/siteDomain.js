// siteDomain.js
'use strict';
var mailService = require('../config/mail');
var express = require('express');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var model = require('../model/socialstechnologies');
var supportEmail = 'support@socialstechnologies.com';


let mailTransporter = nodemailer.createTransport(mailService.sst);
function readMails(filter){
}
function sendMail(mail){
	return new Promise(function(resolve, reject){
		if (!mail) {
			reject(generateRequestError('The mail to be sended has not information or is invalid'));
			return;
		} else {

			if (!mail.createdBy) {
				reject(generateBusinessError(400, 'The information from the mail creator is required.'));
			}

			model.mail({
				_id: 		mongoose.Types.ObjectId(),
				createdBy: 	{
								_id: mail.createdBy._id,
								on: Date()
							},
				status: 	'scheduled',
				from: 		'info@socialstechnologies.com',
				to: 		mail.to,
				subject: 	mail.title,
				text: 		mail.plainText,
				html: 		mail.html,
				service: 	mailService.service
			}).then(function(err, registeredMail){
				if (!err) {
					mailTransporter.sendMail(registeredMail, (error, result)=>{
						if (!error) {
							registeredMail.status = 'delivered';
							registeredMail.save(function(err, updatedMail){
								if (!err) {
									resolve(updatedMail);
									return;	
								} else {
									var error = generateAPIError(err);
									registeredMail.error = error;
									resolve(registeredMail);
									return;
								}
								
							})
						} else {
							registeredMail.status = 'pending';
							registeredMail.error = error;

						}
					})
				} else {
					reject(generateAPIError(err));
					return;
				}
			})
		}
	})
}

function readSSTContents(name){
	return new Promise(function(resolve,reject){

		if (!name) {
			reject(generateRequestError('The caller has not provided the [name] parameter in the request.'))
			return
		}

		try{
			model.content.findOne({name:name}, function(err, retrievedContent){
				if (!err) {
					if (retrievedContent) {
						resolve(retrievedContent)
						return	
					} else {
						reject(generateBusinessError(209, 'No content was found for the given criteria.'))
						return
					}
				} else {
					reject(generateAPIError(err))
					return
				}
			}) 
		} catch (ex){
			console.log(ex)
			reject(generateAPIError(ex))
			return
		}


		/*
		try{
			var content = {
				items: [
					{
						imageUrl:'/client/resources/img/IMG_3240.JPG'
						,minHeight:"20em"
						,title:'Capabilities'
						,subtitle:'Solutions with Social Impact'
						,details:[
							{
								imageUrl:'http://www4.pictures.lonny.com/lo/rQ7V5XzYyCXl.jpg',
								text:'<p>Go social</p><span>As with many people, We wonder why, in modern times like these, social issues can\'t be addressed effectively. People around the world is becoming aware of the benefits of technology in areas such as <b>Healthcare</b>, <b>Logistics</b>, <b>Democracy</b>, among others. This is the time to leverage technology development upon our society. With everyone\'s commitment and dedication, technology will enhance the impact of local initiatives to support community\'s predicaments.</span><hr>'
							},
							{
								imageUrl:'http://www4.pictures.lonny.com/lo/rQ7V5XzYyCXl.jpg',
								text:'<p>Go mobile</p><span>Mobile Solutions are the beginning of the journey. We\'re aware of the multiple opportunities offered by mobile technologies, such as <b>efficiency</b>, <b>immediacy</b>, and <b>portability</b>. Additionally, because of mobile technologies capabilities, new forms of information have emerged and changed the way we learn. By using creativity these new forms of information provide <b>valuable knowledge</b>; a knowledge that can escalate the business impact. So, we\'ve focused our initial efforts in the mastering of core technologies enduring mobile solutions:<br><br><ul><li>Mobile Sensors</li><li>Embedded Persitence Mechanisms</li><li>Web APIs</li><li>Geolocation</li><li>Social Networks</li><li>OAUTH</li></ul></span><hr>'
							}
						]
					},
					{
						imageUrl:'/client/resources/img/IMG_3207.JPG'
						,minHeight:"20em"
						,subtitle:'In Social S Technologies...'
						,title:'What the S stands for?'
						,details:[
							{ 
								imageUrl:'/client/resources/img/socialstechnologies-s.PNG',
								text:'<p><strong>\'S\'</strong> Stands for <b>S</b>ustainability</p><span>It is not a secret we\'re in the middle of a technologic revolution. At the same time, we are the witness of concerning social issues that affect our community. If the industry found out innovative ways to get benefits from technology, why cannot society?.<br><br>It is required to find a way to ease people\'s helping people, to spot for innovative ways of supporting charities and non-profit initiatives through technology. <b>Mobility</b>, <b>Artificial Intelligence (AI)</b>, <b>Internet of Things (IoT)</b>, among other technologies, are emerging to make the future a reality. <br><br>Our motivation is finding a way to offer <b>Sustaibable solutions</b> for communities, people, and local business. We pursue a model that would address global problems such as <b>Homelessness</b>, <b>Poverty</b>, <b>Undernourishment</b>, <b>Unemployment</b>, <b>Healthcare</b> and so on. It can be achieved by the relying on simple but robust technologic solutions; solutions that will assist people in solving everyday problems of the community.<br><br>There are a bunch of application scenarios. <br><br><b>So, let\'s make it real TOGETHER!</b></span><hr/>' 
							}
							, { 
								imageUrl:'/client/resources/img/IMG_3222.JPG',
								text:'<p><strong>\'S\'</strong> Stands for <b>S</b>trategy</p><span>Technology is a powerful tool for business, but it isn\'t a competitive advantage by itself anymore. By applying <b>ITIL®</b> framework practices, we start by understanding your business goals, objectives, and strategy, such a way together we can identify the technologies that better fit your expectations and capabilities, and align them to your strategy. Your business is not technology focused. So, you shouldn\'t invest in pure technology but technologic solutions.</span><hr/>'
							}
							, { 
								imageUrl:'/client/resources/img/IMG_3218.JPG',
								text:'<p><strong>\'S\'</strong> Stands for <b>S</b>olutions</p><span>Because of cost and intrinsic complexity, technology in small businesses happens to be frightening. However, we\'re used to enjoying of benefits of Technology in our everyday life. Solutions thinking is the key to attaining it. We believe that cutting edge technologies are there not only to address complex business environments but also enhance your business everyday problems by solutions tailored to your needs and expectations; just like in your daily life.</span><br/><br/><span><b>AI</b>, <b>IoT</b> and <b>Mobility</b> are there to make it easier than ever. Besides, because of the <b>Cloud Computing</b>, it hasn\'t to be as expensive as a few years ago. That\'s our <b>Solutions</b> thinking, the integration of technologies into specific approaches to make your business better and simpler.</span><hr/>'
							}
							, { 
								imageUrl:'/client/resources/img/IMG_3197.JPG',
								text:'<p><strong>\'S\'</strong> Stands for <b>S</b>implicity</p><span>The simpler, the better. As simple as it sounds. The simplicity of a solution makes it maintainable and <b>Scalable</b>. While looking for simplicity, We assess how technologies can get simpler your business activities, and then, which is the <b>Simplest Solution</b> that fits your needs and expectations.</span><hr/>'
							}
							, { 
								imageUrl:'https://s-media-cache-ak0.pinimg.com/564x/8e/03/8c/8e038c69f35d96d2777396ef1ed77a65.jpg',
								text:'<p><strong>\'S\'</strong> Stands for <b>S</b>calability</p><span>Scalability is the capability of technologic solutions to commensurate your business growth.  Thereby keeping all simple, it is possible to reduce the risk of incompatibilities within the business know-how and business tools. If technologic solutions are simple and standardized, the natural evolution of business is feasible. In Social Solution Technologies, we look for robust, scalable solutions that enable the <b>Business renovation and expansion</b>.</span><hr/>'
							}
						]
					},
					{
						imageUrl:'/client/resources/img/IMG_3214.JPG'
						,minHeight:"20em"
						,title:'This is the title #1'
						,subtitle:'This is the subtitle #1'
						,details:[{imageUrl:'http://www4.pictures.lonny.com/lo/rQ7V5XzYyCXl.jpg',text:'Today is a great day. Today is a great day. Today is a great day. Today is a great day. Today is a great day.'}]
					}
					
				]
			}
			resolve(content)
		} catch (ex){
			console.log(ex)
			reject(generateAPIError(ex))
		}*/
	})
}

function setSSTContent(content){
	return new Promise(function(resolve, reject){
		try{


			if (!content) {	
				reject(generateRequestError('The caller has not provided the [content] parameter in the request.'))
				return
			}

			model.content.findOne({name:content.name}, function(err, retrievedContent){
				if (!err) {
					if (retrievedContent) {
						
						if (!content.modifiedBy) {
							reject(generateBusinessError(400, 'When updating a content, the modifiedBy field must be provided.'))
							return
						}

						retrievedContent.modifiedBy = {
							_id: content.modifiedBy._id,
							on: Date()
						}

						if (!content.items || content.items.length == 0) {
							reject(generateBusinessError(400, 'The value for the field [items] of the [content] parameter is mandatory and can\'t be empty.'))
							return
						}

						retrievedContent.items = content.items
						retrievedContent.save(function(err, updatedContent){
							if (!err) {
								resolve(updatedContent)
								
							} else {
								reject(generateAPIError(err))
								
							}
							return
						})
						
					} else {
						if (!content.createdBy) {
							reject(generateBusinessError(400, 'When creating a content, the createdBy field must be provided.'))
							return
						}

						var newContent = model.content({
							_id: 		mongoose.Types.ObjectId(),
							createdBy:  {
											_id: 	content.createdBy._id,
											on: 	Date()
										},
							name: 		content.name,
							isActive: 	true,
							items: 		[
											{	imageUrl: 		''
												, minHeight: 	'10em'
												, title: 		''
												, subtitle: 	''
												, details:  	[
																	{	text: 		''
																		, imageUrl: ''
																	}
												]
											}
										]
						})

						newContent.save(function(err, registeredContent){
							if (!err) {
								resolve(registeredContent)
								
							} else {
								reject(generateAPIError(err))
								
							}
							return
						})
					}
				} else {
					reject(generateAPIError(err))
					return
				}
			}) 
		} catch (ex){
			console.log(ex)
			reject(generateAPIError(ex))
			return
		}
	})
}

function createInteraction(interaction){

	return new Promise(function(resolve,reject){

		try{

			if (!interaction) {
				reject(generateRequestError('The caller has not provided the interaction parameter in the request.'))
				return
			}

			var newInteraction = model.interaction({
				_id: 		mongoose.Types.ObjectId(),
				createdBy: 	{
								customer: 	{
												name: 	interaction.name,
												email: 	interaction.email
								}, 
								on: Date()
				},
				subject: 	interaction.subject,
				type: 		'ContactRequest',
				details: 	interaction.details,
				status: 	'Created'
			})
			newInteraction.save(function(err, registeredInteraction){
				if (!err) {
					resolve(registeredInteraction)
				} else {
					reject(generateAPIError(err))
				}
			})
		} catch (ex){
			console.log(ex)
			reject(generateAPIError(ex))
		}
	})
}

function generateAPIError(errorInformation){
	var error = {
		code: 500,
		message: 'Ops! I\'m afraid to tell you something went wrong. Please try again. If the problem persists report the issue via <a href="mailto:' + supportEmail + '"><strong>mail</strong></a>.',
		error: { data: errorInformation.toString() }
	}
	return error
}

function generateRequestError(errorInformation){
	var error = {
		code: 400,
		message: 'Ops! I\'m afraid to tell you the calling is not consistent. Please validate the submmited information and try again.',
		error: { data: errorInformation.toString() }
	}
	return error
}

function generateBusinessError(errorCode, errorInformation){
	var error = {
		code: errorCode,
		message: 'Ops! I\'m afraid to tell you there were validations problems with the submitted information. Please review the error details and try again.',
		error: { data: errorInformation.toString() }
	}
	return error
}
module.exports = {
	interaction:{
		new: createInteraction
	},
	content:{
		read: readSSTContents,
		set: setSSTContent
	},
	mail:{
		read: readMails,
		send: sendMail
	}
}