var express = require('express');
var router = express.Router();
var domain = require('../server/domain/siteDomain');

/* GET home page. */
router.post('/', function(req, res, next) {
	
  var interaction = req.body.interaction
  domain.interaction.new(interaction).then(function(interaction){
  		console.log('Interaction processed!')
  		console.log(interaction)
	  	message = { 
	  		code: 0,
	  		message: 'Thank you for your interest. We\'re going to check out your request in short. Meanwhile, don\'t miss out our latest news and updates.',
	  		data: interaction
	  	}
	  	res.status(200).json(message)
	  }
  ).catch(ex=>{ 
  	console.log(ex)
  	res.status(500).json(ex)})
});

module.exports = router;
