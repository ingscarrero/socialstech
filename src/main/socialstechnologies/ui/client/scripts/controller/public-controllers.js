'use strict';
var publicController = angular.module('publicController', ['ui.bootstrap'])

publicController.controller('defaultController', function () {})

publicController.controller('homeController', function ($scope,
  $location,
  $timeout,
  $http,
  $sce,
  Content
) {

  var $ctrl = this

  $ctrl.content = {
    items: []
  }

  Content.home().then(function (response) {
    $ctrl.content.items = response.items
    angular.forEach($ctrl.content.items, function (item, i) {
      angular.forEach(item.detail, function (detail, j) {
        detail.text = $sce.trustAsHtml(detail.text)
      })
    })
  }).catch(function (error) {
    console.log(error.data.message);
  })

  $ctrl.edit = function () {
    $location.path('/home/edit');
  }
})

publicController.controller('aboutController', function ($scope,
  $location,
  $timeout,
  $http,
  $sce,
  Content
) {

  var $ctrl = this
  $ctrl.content = {
    items: []
  }

  Content.about().then(function (response) {
    $ctrl.content.items = response.items
    angular.forEach($ctrl.content.items, function (item, i) {
      angular.forEach(item.details, function (detail, j) {
        detail.text = $sce.trustAsHtml(detail.text)
      })
    })
  }).catch(function (error) {
    console.log(error.data.message);
  })

  $ctrl.edit = function () {
    $location.path('/about/edit');
  }
})



publicController.controller('signUpController', function ($uibModal,
  $log,
  $document,
  $http,
  $location,
  $routeParams,
  Auth,
  crypt
) {
  var $ctrl = this
  $ctrl.content = {
    video: {
      poster: '/client/resources/img/IMG_3240.JPG',
      mov: '/client/resources/video/IMG_3212.MOV'
    }
  }
  $ctrl.registration = {
    username: undefined,
    password: undefined,
    confirmPassword: undefined
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

  $ctrl.submit = function (isValid) {
    var passwordHash = crypt.hash($ctrl.registration.password)
    Auth.signIn($ctrl.registration.username, passwordHash)
      .then(function (response) {
        $location.path("/signup/confirmSignup");
      }, function (error) {
        console.log(error.data.message);
        $ctrl.infoTitle = 'User Registration'
        $ctrl.message = error.data.message
        $ctrl.buttons = [{
          action: function ($uibModalInstance, model) {
            $uibModalInstance.close('ok');
          },
          title: 'OK',
          class: 'btn btn-primary btn-lg btn-block'
        }]

        $ctrl.open('lg', '.modal-parent')
      })

  }
})

publicController.controller('activationController', function (
  $routeParams,
  $location,
  Auth) {

  var requestId = $routeParams.activation_request;

  var $ctrl = this;

  $ctrl.activateAccount = function (requestId) {
    Auth.activateAccount(requestId)
      .then(function (response) {
        $location.path('/activation/confirmActivation');
      }, function (error) {
        console.log(error.data.message);
        $location.path('/home');
      })
  }

  $ctrl.activateAccount(requestId);
})

publicController.controller('activityConfirmController', function (
  $routeParams,
  Content,
  $sce
) {

  var action = $routeParams.action;
  var $ctrl = this;

  $ctrl.retrieveMessage = function () {
    Content.confirmation(action)
      .then(function (result) {
        $ctrl.message = result.items[0];
      }).catch(err => {
        console.log(err);
        var html,
          title,
          subtitle;

        switch (action) {
          case 'confirmSignup':
            html = '<p>You have registered successfully. The next step is updating ' +
              'some basic demographic information from you.</p>' +
              '<br/><a class="btn btn-primary btn-lg btn-block" href="#!/demographics">Proceed</a>';
            title = 'Welcome to the party!';
            subtitle = 'Thank you for join us!'
            break;
          case 'confirmActivation':
            html = '<p>You have completed the activation process successfully.</p>' +
              '<br/><a class="btn btn-primary btn-lg btn-block" href="#!/login">Proceed</a>';
            title = 'All done!';
            subtitle = 'We hope it were simple!'
            break;
          default:
            break;
        }

        $ctrl.message = {
          imageUrl: 'http://c',
          minHeight: '40em',
          title: title,
          subtitle: subtitle,
          details: [{
            text: html,
            imageUrl: ''
          }]
        }

        angular.forEach($ctrl.message.details, function (detail, i) {
          detail.text = $sce.trustAsHtml(detail.text)
        })

      })
  }

  $ctrl.retrieveMessage();

})

publicController.controller('demographicsController', function ($uibModal,
  Auth,
  Demographic
) {
  var $ctrl = this;


  $ctrl.contact = {};

  $ctrl.retrieveContactInformation = function () {
    Auth.currentIdentity()
      .then(function (response) {
        $ctrl.contact = response.contact;
      }, function (error) {
        console.log(error.data.message);
      })
  }

  $ctrl.save = function () {
    Auth.currentIdentity()
      .then(function (response) {
        $ctrl.contact.modifiedBy = {
          _id: response.user._id
        }
        Demographic.update(response.user._id, $ctrl.contact)
          .then(response => {
            $ctrl.infoTitle = 'User Registration'
            $ctrl.message = response
            $ctrl.buttons = [{
              action: function ($uibModalInstance, model) {
                $uibModalInstance.close('ok');
              },
              title: 'OK',
              class: 'btn btn-primary btn-lg btn-block'
            }]

            $ctrl.open('lg', '.modal-parent')
          }, error => {
            console.log(error.data.message);
            $ctrl.infoTitle = 'User Registration'
            $ctrl.message = error.data.message
            $ctrl.buttons = [{
              action: function ($uibModalInstance, model) {
                $uibModalInstance.close('ok');
              },
              title: 'OK',
              class: 'btn btn-primary btn-lg btn-block'
            }]

            $ctrl.open('lg', '.modal-parent')
          });
      }, function (error) {
        console.log(error.data.message);
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


  $ctrl.retrieveContactInformation();
})

publicController.controller('loginController', function ($scope,
  $uibModal,
  $log,
  $document,
  $http,
  $location,
  $routeParams,
  Auth,
  Header,
  crypt
) {

  var urlRedirect = $location.search().url_redirect;

  $scope.header = Header;


  var $ctrl = this
  $ctrl.content = {
    video: {
      poster: '/client/resources/img/IMG_3240.JPG',
      mov: '/client/resources/video/IMG_3212.MOV'
    }
  }
  $ctrl.login = {
    username: undefined,
    password: undefined
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

  $ctrl.submit = function (isValid) {
    var passwordHash = crypt.hash($ctrl.login.password)
    Auth.logIn($ctrl.login.username, passwordHash)
      .then(function (response) {
        if (urlRedirect) {
          $location.path(decodeURIComponent(urlRedirect));
          $location.search('url_redirect', null);
        } else {
          $location.path("/");
        }
      }, function (error) {
        console.log(error.data.message);
        $ctrl.infoTitle = 'Access Control'
        $ctrl.message = error.data.message
        $ctrl.buttons = [{
          action: function ($uibModalInstance, model) {
            $uibModalInstance.close('ok');
          },
          title: 'OK',
          class: 'btn btn-primary btn-lg btn-block'
        }]

        $ctrl.open('lg', '.modal-parent')
      })
  }
})



publicController.controller('contactController', function ($uibModal,
  $log,
  $document,
  $http,
  $location,
  $routeParams
) {
  var $ctrl = this
  $ctrl.interaction = {}

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
    /*
    modalInstance.result.then(function () {
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });*/
  }

  $ctrl.save = function (isValid) {
    if (isValid === true) {
      $http.post(
          '/api/sst/interaction', {
            interaction: $ctrl.interaction
          })
        .then(
          function (response) {
            $ctrl.infoTitle = 'Contact Request Confirmation'
            $ctrl.message = response.data.message
            $ctrl.buttons = [{
              action: function ($uibModalInstance, model) {
                $uibModalInstance.close('ok');
                // Default
                $location.path("/");
              },
              title: 'OK',
              class: 'btn-primary'
            }]


            $ctrl.open('lg', '.modal-parent')
            console.log(response)
          },
          function (error) {
            console.log(error.data.message);
          }
        );
    }
  }

  $ctrl.cancel = function () {
    $location.path('/home');
  }
})