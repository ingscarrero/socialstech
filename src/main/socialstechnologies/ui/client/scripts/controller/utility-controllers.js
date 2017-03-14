'use strict';
var utilityController = angular.module('utilityController', ['ui.bootstrap'])


utilityController.controller('headerController', function($http, 
  $scope,
  $location, 
  $window,
  Auth, 
  Content,
  Header
){

  var $ctrl = this
  $scope.header = Header;

  $ctrl.header = $scope.header;
})

utilityController.controller('modalInstanceController', function ( $uibModalInstance, 
  infoTitle, 
  message, 
  buttons
){
	var $ctrl = this;
	$ctrl.infoTitle = infoTitle;
	$ctrl.message = message;
	$ctrl.buttons = buttons;

  $ctrl.perform = function(){
    var func = arguments[0]
    return func($uibModalInstance, $ctrl.model)
  }
})



