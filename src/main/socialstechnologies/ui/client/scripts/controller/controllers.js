var sstController = angular.module('sstController', ['ui.bootstrap'])

sstController.controller('mainController', function(){
  var $ctrl = this
  $ctrl.menu ={
    items:[
      {action:"#!/home", title:"Home"},
      {action:"#!/about", title:"About"},
      {action:"#!/contact", title:"Contact"}
    ]
  }
})

sstController.controller('defaultController', function(){

})

sstController.controller('homeController', function(){

})

sstController.controller('contactController', function($uibModal, $log, $document, $http, $location, $routeParams){
  var $ctrl = this
  $ctrl.interaction = {}

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

  $ctrl.save = function(isValid) {
      console.log('OK')
      console.log($ctrl.interaction)
      if (isValid === true) {
        $http.post(
        '/api/interaction', 
        { interaction: $ctrl.interaction })
      .then(
        function(response){
          $ctrl.infoTitle = 'Contact Request Confirmation'
          $ctrl.message = response.data.message
          $ctrl.buttons = [{
            action: function ($uibModalInstance, model) {
              $uibModalInstance.close('ok');
              // Default
              $('.nav.masthead-nav>li').removeClass()
              $location.path("/");
            }, 
            title:'OK', 
            class:'btn-primary'
          }]
          $ctrl.open('lg', '.modal-parent')
          console.log(response)
        }, 
        function(error){
          console.log(error);
        }
      );
      }
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
})
