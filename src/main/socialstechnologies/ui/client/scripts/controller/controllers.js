var sstController = angular.module('sstController',['ui.bootstrap'])
sstController.controller('defaultController', function(){
 
})

sstController.controller('homeController', function(){
 
})

sstController.controller('contactController', function($uibModal, $log, $document, $http, $location, $routeParams){
 	var $ctrl = this
 	$ctrl.interaction = { 
 		name:"", 
 		email:"", 
 		subject:"",
 		details:"" 
 	}

  $ctrl.open = function(size, parentSelector){
  var parentElem = parentSelector ? 
      angular.element($document[0].querySelector('.modal-target ' + parentSelector)) : undefined;
    var modalInstance = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: '/client/partials/modal.html',
      controller: 'modalInstanceController',
      controllerAs: '$ctrl',
      size: size,
      appendTo: parentElem,
      resolve: {
        infoTitle: function () {
          return $ctrl.infoTitle
        },
        message: function () {
          return $ctrl.message
        },
        buttons: function() {
          return $ctrl.buttons
        }
      }
    });

    modalInstance.result.then(function () {
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
}

 	$ctrl.save = function() {
 		console.log('OK')
 		console.log($ctrl.interaction)
 		$http.post('/api/interaction', 
 			{ interaction: $ctrl.interaction })
 			.then(function(response){
        $ctrl.infoTitle = 'Test'
        $ctrl.message = response.data.message
        $ctrl.buttons = [
          {
            action:function ($uibModalInstance, model) {
              $uibModalInstance.close('ok');
            }, title:'OK', 
            class:'btn-primary'
          }
        ]
 				$ctrl.open('lg', '.modal-parent')
 				console.log(response)
 			}, function(error){
 				console.log(error);
 			}
 		);
 	} 	
})

sstController.controller('aboutController', function(){
 
})

sstController.controller('modalInstanceController', function ($uibModalInstance, infoTitle, message, buttons){
	var $ctrl = this;
	$ctrl.infoTitle = infoTitle;
	$ctrl.message = message;
	$ctrl.buttons = buttons;

  $ctrl.perform = function(){
    var func = arguments[0]
    return func($uibModalInstance, $ctrl.model)
  }
/*
	$ctrl.ok = function () {
		$uibModalInstance.close('ok');
	};

	$ctrl.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};*/
})
