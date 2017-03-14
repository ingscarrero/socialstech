'use strict';
var sstController = angular.module('sstController', ['ui.bootstrap'])

sstController.controller('accountElevationController', function ($uibModal,
  $routeParams,
  $location,
  $sce,
  $scope,
  Auth,
  Request
) {


  var requestId = $routeParams.elevation_request;

  var $ctrl = this;

  $ctrl.retrieveItems = function () {
    Request.retrieveRequest(requestId).then(request => {
      angular.forEach(request.details, function (item, i) {
        item.details = $sce.trustAsHtml(item.details.replace('\n', '<br>'));
        item.date = new Date(item.date);
      })
      $ctrl.request = request;
    }).catch(err => {
      // Show modal with error information.
      $ctrl.infoTitle = 'Elevation Request Processing'
      $ctrl.message = err.data.message
      $ctrl.buttons = [{
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('ok');
        },
        title: 'OK',
        class: 'btn btn-danger btn-lg btn-block'
      }]
      $ctrl.open('lg', '.modal-parent');
    });
  }

  $ctrl.open = function (size, parentSelector) {

    var parentElem = parentSelector ?
      angular.element(document.querySelector('.modal-target ' + parentSelector)) : undefined;
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
        infoTitle: () => $ctrl.infoTitle,
        message: () => $ctrl.message,
        buttons: () => $ctrl.buttons
      }
    });
  }

  $ctrl.approve = function () {

    Auth.resolveElevationRequest(requestId, 'approve').then(response => {
      $ctrl.infoTitle = 'Elevate Request Process Confirmation'
      $ctrl.message = response;
      $ctrl.buttons = [{
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('ok');
          // Default
          $location.path("/home");
        },
        title: 'OK',
        class: 'btn-primary'
      }]
      $ctrl.open('lg', '.modal-parent');

    }).catch(err => {
      // Show modal with error information.
      $ctrl.infoTitle = 'Elevation Request Processing';
      $ctrl.message = err.data.message;
      $ctrl.buttons = [{
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('ok');
        },
        title: 'OK',
        class: 'btn btn-danger btn-lg btn-block'
      }]
      $ctrl.open('lg', '.modal-parent');
    });

  }

  $ctrl.deny = function () {

    Auth.resolveElevationRequest(requestId, 'deny').then(response => {
      $ctrl.infoTitle = 'Elevate Request Process Confirmation'
      $ctrl.message = response;
      $ctrl.buttons = [{
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('ok');
          // Default
          $location.path("/home");
        },
        title: 'OK',
        class: 'btn-primary'
      }]
      $ctrl.open('lg', '.modal-parent');

    }).catch(err => {
      // Show modal with error information.
      $ctrl.infoTitle = 'Elevation Request Processing';
      $ctrl.message = err.data.message;
      $ctrl.buttons = [{
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('ok');
        },
        title: 'OK',
        class: 'btn btn-danger btn-lg btn-block'
      }]
      $ctrl.open('lg', '.modal-parent');
    });
  }

  $ctrl.cancel = function () {
    $location.path('/home');
  }

  $ctrl.retrieveItems();
});

sstController.controller('adminController', function ($uibModal,
  $location,
  Auth) {

  var $ctrl = this;

  $ctrl.request = {
    details: [{
      title: 'Elevation Request',
      details: '',
      date: Date()
    }]
  };

  $ctrl.open = function (size, parentSelector) {

    var parentElem = parentSelector ?
      angular.element(document.querySelector('.modal-target ' + parentSelector)) : undefined;
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
        infoTitle: () => $ctrl.infoTitle,
        message: () => $ctrl.message,
        buttons: () => $ctrl.buttons
      }
    });
  }

  $ctrl.cancel = function () {
    $location.path('/home');
  }
  $ctrl.submit = function () {
    $ctrl.infoTitle = 'Profile Upgrade Request'
    $ctrl.message = "You are about to submit an application for Profile Elevation. Are you sure to proceed?"
    $ctrl.buttons = [{
        action: function ($uibModalInstance, model) {
          // Get request author identity
          Auth.currentIdentity().then(result => {

            // Complete reques information
            var userId = result.user._id;
            $ctrl.request.from = userId;
            $ctrl.request.createdBy = {
              _id: userId,
              on: Date()
            }

            // Submit request
            Auth.submitElevationRequest($ctrl.request).then(result => {
              // Show confirmation Modal
              $ctrl.infoTitle = 'Profile Upgrade Request'
              $ctrl.message = result
              $ctrl.buttons = [{
                action: function ($uibModalInstance, model) {
                  $uibModalInstance.close('ok');
                },
                title: 'OK',
                class: 'btn btn-primary btn-lg btn-block'
              }]

              $ctrl.open('lg', '.modal-parent')

            }, err => {
              // Show modal with error information.
              $ctrl.infoTitle = 'Profile Upgrade Request'
              $ctrl.message = err.data.message;
              $ctrl.buttons = [{
                action: function ($uibModalInstance, model) {
                  $uibModalInstance.close('ok');
                },
                title: 'OK',
                class: 'btn btn-danger btn-lg btn-block'
              }]

              $ctrl.open('lg', '.modal-parent')
            })

            $uibModalInstance.close('ok');
          }, err => {
            console.log(error.data.message);
            $location.path('/login');
          })
        },
        title: 'OK',
        class: 'btn btn-primary btn-lg btn-block'
      },
      {
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('cancel');
        },
        title: 'Cancel',
        class: 'btn btn-default btn-lg btn-block'
      }
    ]

    $ctrl.open('lg', '.modal-parent')
  }
})

sstController.controller('homeEditController', function ($uibModal,
  $scope,
  $location,
  $http,
  $sce,
  Content,
  Auth
) {

  var $ctrl = this

  $ctrl.content = {};

  $ctrl.retrieveItems = function () {

    Content.home().then(function (response) {
      $ctrl.content.items = response.items

      angular.forEach($ctrl.content.items, function (item, i) {
        angular.forEach(item.details, function (detail, j) {
          detail.renderedHtml = $sce.trustAsHtml(detail.text)
        })
      })

    }).catch(function (error) {
      console.log(error.data.message);
      if (error.data.code == 400) {

        Auth.currentIdentity()
          .then(function (response) {
            $ctrl.content.createdBy = {
              _id: response.user._id
            }

            Content.setHome($ctrl.content)
              .then((response) => {
                $ctrl.content.items = response.items
              }).catch((err) => {

                $ctrl.infoTitle = 'Home Edition'
                $ctrl.message = err.data.message
                $ctrl.buttons = [{
                  action: function ($uibModalInstance, model) {
                    $uibModalInstance.close('ok');
                  },
                  title: 'OK',
                  class: 'btn btn-danger btn-lg btn-block'
                }]

                $ctrl.open('lg', '.modal-parent')

              })
          }, function (error) {
            console.log(error.data.message);
            $location.path('/login');
          })
      }
    })
  }

  $ctrl.open = function (size, parentSelector) {
    var parentElem = parentSelector ?
      angular.element(document.querySelector('.modal-target ' + parentSelector)) : undefined;
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
        infoTitle: () => $ctrl.infoTitle,
        message: () => $ctrl.message,
        buttons: () => $ctrl.buttons
      }
    });
  }

  $ctrl.renderHtml = function (itemIndex, detailIndex) {
    $ctrl.content.items[itemIndex]
      .details[detailIndex]
      .renderedHtml = $sce.trustAsHtml(
        $ctrl.content
        .items[itemIndex]
        .details[detailIndex].text
      );
  }

  $ctrl.save = function () {
    $ctrl.infoTitle = 'Home Edition'
    $ctrl.message = "You are about to save the changes made in home contents. Are you sure to proceed?"
    $ctrl.buttons = [{
        action: function ($uibModalInstance, model) {
          Auth.currentIdentity()
            .then(function (response) {
              $ctrl.content.modifiedBy = {
                _id: response.user._id
              }

              Content.setHome($ctrl.content)
                .then((response) => {

                  $location.path('/home')
                }).catch((err) => {

                  $ctrl.infoTitle = 'Home Edition'
                  $ctrl.message = err.data.message
                  $ctrl.buttons = [{
                    action: function ($uibModalInstance, model) {
                      $uibModalInstance.close('ok');
                    },
                    title: 'OK',
                    class: 'btn btn-danger btn-lg btn-block'
                  }]

                  $ctrl.open('lg', '.modal-parent')
                })

              $uibModalInstance.close('ok');


            }, function (error) {
              console.log(error.data.message);
              $location.path('/login');
            })
        },
        title: 'OK',
        class: 'btn btn-primary btn-lg btn-block'
      },
      {
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('cancel');
        },
        title: 'Cancel',
        class: 'btn btn-default btn-lg btn-block'
      }
    ]

    $ctrl.open('lg', '.modal-parent')
  }

  $ctrl.addItem = function () {
    $ctrl.content.items.push({})
    sst().relocateScroll('item_' + ($ctrl.content.items.length - 2))
  }

  $ctrl.removeItem = function (itemIndex) {
    $ctrl.infoTitle = 'Home Edition'
    $ctrl.message = "You are about to remove the selected item. Are you sure?"
    $ctrl.buttons = [{
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('ok');
          $ctrl.content.items.splice(itemIndex, 1)
        },
        title: 'OK',
        class: 'btn btn-danger btn-lg btn-block'
      },
      {
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('cancel');
        },
        title: 'Cancel',
        class: 'btn btn-default btn-lg btn-block'
      }
    ]

    $ctrl.open('lg', '.modal-parent')

  }

  $ctrl.cancel = function () {
    $ctrl.infoTitle = 'Home Edition'
    $ctrl.message = "You are being redirected to home page. You will lose any unsaved change. Are you sure to continue?"
    $ctrl.buttons = [{
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('ok');
          $location.path('/home');
        },
        title: 'OK',
        class: 'btn btn-danger btn-lg btn-block'
      },
      {
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('cancel');
        },
        title: 'Cancel',
        class: 'btn btn-default btn-lg btn-block'
      }
    ]

    $ctrl.open('lg', '.modal-parent')

  }

  $ctrl.addDetail = function (itemIndex) {
    if (!$ctrl.content.items[itemIndex].details) {
      $ctrl.content.items[itemIndex].details = []
    }

    $ctrl.content.items[itemIndex].details.push({})

    var $id = $ctrl.content.items[itemIndex].details.length == 1 ?
      'item_' + itemIndex :
      'item_' + itemIndex + '_detail_' + ($ctrl.content.items[itemIndex].details.length - 2)

    sst().relocateScroll($id)
  }

  $ctrl.removeDetail = function (itemIndex, detailIndex) {
    $ctrl.infoTitle = 'Home Edition'
    $ctrl.message = "You are about to remove the selected item. Are you sure?"
    $ctrl.buttons = [{
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('ok');
          $ctrl.content.items[itemIndex].details.splice(detailIndex, 1)
        },
        title: 'OK',
        class: 'btn btn-danger btn-lg btn-block'
      },
      {
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('cancel');
        },
        title: 'Cancel',
        class: 'btn btn-default btn-lg btn-block'
      }
    ]

    $ctrl.open('lg', '.modal-parent')

  }

  $ctrl.retrieveItems();
})

sstController.controller('aboutEditController', function ($uibModal,
  $scope,
  $location,
  $http,
  $sce,
  Content,
  Auth
) {

  var $ctrl = this

  $ctrl.content = {};

  $ctrl.retrieveItems = function () {
    Content.about()
      .then(function (response) {
        $ctrl.content.items = response.items
        angular.forEach($ctrl.content.items, function (item, i) {
          angular.forEach(item.details, function (detail, j) {
            detail.renderedHtml = $sce.trustAsHtml(detail.text)
          })
        })
      }).catch(function (error) {
        console.log(error.data.message);
        if (error.data.code == 400) {
          Auth.currentIdentity()
            .then(function (response) {

              $ctrl.content.createdBy = {
                _id: response.user._id
              }

              Content.setAbout($ctrl.content)
                .then((response) => {
                  $ctrl.content.items = response.items
                }).catch((err) => {

                  $ctrl.infoTitle = 'About Edition'
                  $ctrl.message = err.data.message
                  $ctrl.buttons = [{
                    action: function ($uibModalInstance, model) {
                      $uibModalInstance.close('ok');
                    },
                    title: 'OK',
                    class: 'btn btn-danger btn-lg btn-block'
                  }]

                  $ctrl.open('lg', '.modal-parent')

                })
            }, function (error) {
              console.log(error.data.message);
              $location.path('/login');
            })
        }
      })
  }

  $ctrl.open = function (size, parentSelector) {
    var parentElem = parentSelector ?
      angular.element(document.querySelector('.modal-target ' + parentSelector)) : undefined;
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
        infoTitle: () => $ctrl.infoTitle,
        message: () => $ctrl.message,
        buttons: () => $ctrl.buttons
      }
    });
  }

  $ctrl.renderHtml = function (itemIndex, detailIndex) {
    $ctrl.content.items[itemIndex]
      .details[detailIndex]
      .renderedHtml = $sce.trustAsHtml(
        $ctrl.content
        .items[itemIndex]
        .details[detailIndex].text
      );
  }

  $ctrl.save = function () {
    $ctrl.infoTitle = 'About Edition'
    $ctrl.message = "You are about to save the changes made in about contents. Are you sure to proceed?"
    $ctrl.buttons = [{
        action: function ($uibModalInstance, model) {
          Auth.currentIdentity()
            .then(function (response) {
              $ctrl.content.modifiedBy = {
                _id: response.user._id
              }

              Content.setAbout($ctrl.content)
                .then((response) => {
                  $location.path('/about')
                }).catch((err) => {

                  $ctrl.infoTitle = 'About Edition'
                  $ctrl.message = err.data.message
                  $ctrl.buttons = [{
                    action: function ($uibModalInstance, model) {
                      $uibModalInstance.close('ok');
                    },
                    title: 'OK',
                    class: 'btn btn-danger btn-lg btn-block'
                  }]

                  $ctrl.open('lg', '.modal-parent')
                })

              $uibModalInstance.close('ok');


            }, function (error) {
              console.log(error.data.message);
              $location.path('/login');
            })
        },
        title: 'OK',
        class: 'btn btn-primary btn-lg btn-block'
      },
      {
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('cancel');
        },
        title: 'Cancel',
        class: 'btn btn-default btn-lg btn-block'
      }
    ]

    $ctrl.open('lg', '.modal-parent')
  }

  $ctrl.addItem = function () {
    $ctrl.content.items.push({})
    sst().relocateScroll('item_' + ($ctrl.content.items.length - 2))
  }

  $ctrl.removeItem = function (itemIndex) {
    $ctrl.infoTitle = 'About Edition'
    $ctrl.message = "You are about to remove the selected item. Are you sure?"
    $ctrl.buttons = [{
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('ok');
          $ctrl.content.items.splice(itemIndex, 1)
        },
        title: 'OK',
        class: 'btn btn-danger btn-lg btn-block'
      },
      {
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('cancel');
        },
        title: 'Cancel',
        class: 'btn btn-default btn-lg btn-block'
      }
    ]

    $ctrl.open('lg', '.modal-parent')

  }

  $ctrl.cancel = function () {
    $ctrl.infoTitle = 'About Edition'
    $ctrl.message = "You are being redirected to the About page. You will lose any unsaved change. Are you sure to continue?"
    $ctrl.buttons = [{
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('ok');
          $location.path('/about');
        },
        title: 'OK',
        class: 'btn btn-danger btn-lg btn-block'
      },
      {
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('cancel');
        },
        title: 'Cancel',
        class: 'btn btn-default btn-lg btn-block'
      }
    ]

    $ctrl.open('lg', '.modal-parent')

  }

  $ctrl.addDetail = function (itemIndex) {
    if (!$ctrl.content.items[itemIndex].details) {
      $ctrl.content.items[itemIndex].details = []
    }
    $ctrl.content.items[itemIndex].details.push({})
    var $id = $ctrl.content.items[itemIndex].details.length == 1 ?
      'item_' + itemIndex :
      'item_' + itemIndex + '_detail_' + ($ctrl.content.items[itemIndex].details.length - 2)
    sst().relocateScroll($id)
  }

  $ctrl.removeDetail = function (itemIndex, detailIndex) {
    $ctrl.infoTitle = 'About Edition'
    $ctrl.message = "You are about to remove the selected item. Are you sure?"
    $ctrl.buttons = [{
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('ok');
          $ctrl.content.items[itemIndex].details.splice(detailIndex, 1)
        },
        title: 'OK',
        class: 'btn btn-danger btn-lg btn-block'
      },
      {
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('cancel');
        },
        title: 'Cancel',
        class: 'btn btn-default btn-lg btn-block'
      }
    ]

    $ctrl.open('lg', '.modal-parent')

  }

  $ctrl.retrieveItems();

})