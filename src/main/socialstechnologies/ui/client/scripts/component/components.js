var sstComponent = angular.module('sstComponent', ['ngRoute'])

sstComponent.component('modalComponent', {
  templateUrl: '/client/partials/about.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function () {
    var $ctrl = this;

    $ctrl.$onInit = function () {
      $ctrl.infoTitle = $ctrl.resolve.infoTitle;
      $ctrl.message = $ctrl.resolve.message;
    };

    $ctrl.ok = function () {
      $ctrl.close({$value: 'ok'});
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});


var sstDirective = angular.module('sstDirective', [])

sstDirective.directive('parallax', function($timeout){
  return{
    link: function(scope, element, attrs){
      $timeout(function(){
        sst().parallax(jQuery, window, document);
        sst().animateElementOnShow(jQuery, window, document);
      }, 100);
    }
  }
})

sstDirective.directive('compareTo', function(){
  return {
    require: "ngModel",
    scope: {
      otherModelValue: "=compareTo"
    },
    link: function(scope, element, attributes, ngModel){
      ngModel.$validators.compareTo = function(modelValue){
        return modelValue == scope.otherModelValue
      }
      scope.$watch("otherModelValue", function() {
          ngModel.$validate();
      });
    }
  }
})

sstDirective.directive('permission', ['Auth', '$location', function(Auth, $location, $route) {
   return {
       restrict: 'A',
       scope: {
          permission: '='
       },
       link: function (scope, elem, attrs) {
            scope.$watch(Auth.isLoggedIn, function() {
                Auth.isIdentityAllowed(scope.permission).then((result)=>{
                  if (result === true) {
                    elem.show()
                  } else {
                    elem.hide();
                  }
                }).catch((err)=>{
                  elem.hide();
                })
            });                
       }
   }
}]);