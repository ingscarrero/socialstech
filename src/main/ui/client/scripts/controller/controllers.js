var sstController = angular.module('sstController',[])
sstController.controller('homeController', function(){
 
})

sstController.controller('contactController', ['$scope', '$http', function($scope, $http, $location, $routeParams){
 	
 	$scope.interaction = { 
 		name:"", 
 		email:"", 
 		subject:"",
 		details:"" 
 	}
 	$scope.save = function() {
 		console.log('OK')
 		console.log($scope.interaction)
 	} 	
}])

sstController.controller('aboutController', function(){
 
})