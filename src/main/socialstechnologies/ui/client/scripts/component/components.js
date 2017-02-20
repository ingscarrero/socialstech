var sstComponent = angular.module('sstComponent', [])

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