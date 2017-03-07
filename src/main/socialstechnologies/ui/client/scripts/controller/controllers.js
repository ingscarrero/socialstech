var sstController = angular.module('sstController', ['ui.bootstrap'])


sstController.controller('headerController', function($http, 
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

sstController.controller('defaultController', function(
){
})

sstController.controller('homeEditController', function( $uibModal, 
  $scope, 
  $location,
  $http, 
  $sce, 
  Content,
  Auth
){

  var $ctrl = this
  
  $ctrl.content = {};

  Content.home().then(function(response){
    $ctrl.content.items = response.items

    angular.forEach($ctrl.content.items, function(item, i){
      angular.forEach(item.details, function(detail, j){
        detail.renderedHtml = $sce.trustAsHtml(detail.text)
      })
    })

  }).catch(function(error){
    console.log(error);
    if (error.data.code == 209) {

      Auth.currentIdentity()
      .then(function(response){
        $ctrl.content.createdBy = { _id: response.user._id }

        Content.setHome($ctrl.content)
        .then((response)=>{
          $ctrl.content.items = response.items
        }).catch((err)=>{

          $ctrl.infoTitle = 'Home Edition'
          $ctrl.message = err.data.message
          $ctrl.buttons = [{
            action: function ($uibModalInstance, model) {
              $uibModalInstance.close('ok');
            }, 
            title:'OK', 
            class:'btn btn-danger btn-lg btn-block'
          }]

          $ctrl.open('lg', '.modal-parent')

        })
      }, function(error){
        console.log(error);
        $location.path('/login');
      })
    }
  })


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
        infoTitle: () => $ctrl.infoTitle,
        message: () => $ctrl.message,
        buttons: () => $ctrl.buttons
      }
    });
  }

  $ctrl.renderHtml = function(itemIndex, detailIndex){
    $ctrl.content.items[itemIndex]
      .details[detailIndex]
        .renderedHtml = $sce.trustAsHtml(
          $ctrl.content
            .items[itemIndex]
              .details[detailIndex].text
              );
  }

  $ctrl.save = function(){
    $ctrl.infoTitle = 'Home Edition'
    $ctrl.message = "You are about to save the changes made in home contents. Are you sure to proceed?"
    $ctrl.buttons = [{
      action: function ($uibModalInstance, model) {
        Auth.currentIdentity()
          .then(function(response){
            $ctrl.content.modifiedBy = { _id: response.user._id }

            Content.setHome($ctrl.content)
              .then((response)=>{

                $location.path('/home')
              }).catch((err)=>{

                $ctrl.infoTitle = 'Home Edition'
                $ctrl.message = err.data.message + ': ' + err.data.error.data
                $ctrl.buttons = [{
                  action: function ($uibModalInstance, model) {
                    $uibModalInstance.close('ok');
                  }, 
                  title:'OK', 
                  class:'btn btn-danger btn-lg btn-block'
                }]

                $ctrl.open('lg', '.modal-parent')
              })

            $uibModalInstance.close('ok');


          }, function(error){
            console.log(error);
            $location.path('/login');
          })
      }, 
      title:'OK', 
      class:'btn btn-primary btn-lg btn-block'
    },
    {
      action: function ($uibModalInstance, model) {
        $uibModalInstance.close('cancel');
      }, 
      title:'Cancel', 
      class:'btn btn-default btn-lg btn-block'
    }]

    $ctrl.open('lg', '.modal-parent')
  }

  $ctrl.addItem = function(){
    $ctrl.content.items.push({})
    sst().relocateScroll('item_' + ($ctrl.content.items.length - 2))
  }

  $ctrl.removeItem = function(itemIndex){
    $ctrl.infoTitle = 'Home Edition'
    $ctrl.message = "You are about to remove the selected item. Are you sure?"
    $ctrl.buttons = [{
      action: function ($uibModalInstance, model) {
        $uibModalInstance.close('ok');
        $ctrl.content.items.splice(itemIndex, 1)
      }, 
      title:'OK', 
      class:'btn btn-danger btn-lg btn-block'
    },
    {
      action: function ($uibModalInstance, model) {
        $uibModalInstance.close('cancel');
      }, 
      title:'Cancel', 
      class:'btn btn-default btn-lg btn-block'
    }]

    $ctrl.open('lg', '.modal-parent')
    
  }

  $ctrl.cancel = function(){
    $ctrl.infoTitle = 'Home Edition'
    $ctrl.message = "You are being redirected to home page. You will lose any unsaved change. Are you sure to continue?"
    $ctrl.buttons = [{
      action: function ($uibModalInstance, model) {
        $uibModalInstance.close('ok');
        $location.path('/home');
      }, 
      title:'OK', 
      class:'btn btn-danger btn-lg btn-block'
    },
    {
      action: function ($uibModalInstance, model) {
        $uibModalInstance.close('cancel');
      }, 
      title:'Cancel', 
      class:'btn btn-default btn-lg btn-block'
    }]

    $ctrl.open('lg', '.modal-parent')
    
  }

  $ctrl.addDetail = function(itemIndex){
    if (!$ctrl.content.items[itemIndex].details) {
      $ctrl.content.items[itemIndex].details = []
    }

    $ctrl.content.items[itemIndex].details.push({})

    var $id = $ctrl.content.items[itemIndex].details.length == 1 ? 
      'item_' + itemIndex :
      'item_' + itemIndex + '_detail_' + ($ctrl.content.items[itemIndex].details.length - 2)
    
    sst().relocateScroll($id)
  }

  $ctrl.removeDetail = function(itemIndex, detailIndex){
    $ctrl.infoTitle = 'Home Edition'
    $ctrl.message = "You are about to remove the selected item. Are you sure?"
    $ctrl.buttons = [{
      action: function ($uibModalInstance, model) {
        $uibModalInstance.close('ok');
        $ctrl.content.items[itemIndex].details.splice(detailIndex, 1)
      }, 
      title:'OK', 
      class:'btn btn-danger btn-lg btn-block'
    },
    {
      action: function ($uibModalInstance, model) {
        $uibModalInstance.close('cancel');
      }, 
      title:'Cancel', 
      class:'btn btn-default btn-lg btn-block'
    }]

    $ctrl.open('lg', '.modal-parent')

  }
})

sstController.controller('homeController', function($scope, 
  $location, 
  $timeout, 
  $http, 
  $sce, 
  Content
){

  var $ctrl = this
  $ctrl.content = {
    items: []
  }

  Content.home().then(function(response){
    $ctrl.content.items = response.items
    angular.forEach($ctrl.content.items, function(item, i){
      angular.forEach(item.detail, function(detail, j){
        detail = $sce.trustAsHtml(detail)
      })
    })
  }).catch(function(error){
    console.log(error);
  })

  $ctrl.edit = function(){
    $location.path('/home/edit');
  }
})

sstController.controller('signUpController', function($uibModal, 
  $log, 
  $document, 
  $http, 
  $location, 
  $routeParams, 
  Auth,
  crypt
){

  var $ctrl = this
  $ctrl.content = { 
    video: { 
      poster:'/client/resources/img/IMG_3240.JPG',
      mov:'/client/resources/video/IMG_3212.MOV'
    }
  }
  $ctrl.registration = {
    username:undefined, 
    password:undefined,
    confirmPassword:undefined
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
        infoTitle: () => $ctrl.infoTitle,
        message: () => $ctrl.message,
        buttons: () => $ctrl.buttons
      }
    });
  }

  $ctrl.submit = function(isValid){
    var passwordHash = crypt.hash($ctrl.registration.password)
    Auth.signIn($ctrl.registration.username, passwordHash)
    .then(function(response){
      $location.path("/login/confirm");
    }, function(error){
      console.log(error);
      $ctrl.infoTitle = 'User Registration'
          $ctrl.message = error.data.message
          $ctrl.buttons = [{
            action: function ($uibModalInstance, model) {
              $uibModalInstance.close('ok');
            }, 
            title:'OK', 
            class:'btn btn-primary btn-lg btn-block'
          }]

          $ctrl.open('lg', '.modal-parent')
    })

  }
})

sstController.controller('loginConfirmController', function(Content, 
  $sce
){
  var $ctrl = this

  $ctrl.retrieveLoginMessage = function(){
    Content.loginConfirmation().then(function(result){
        $ctrl.message = result.items[0];
      }).catch(err=>{
        console.log(err);
        var html =  '<p>You have registered successfully. The next step is updating ' +
                    'some basic demographic information from you.</p>' +
                    '<a class="btn btn-default" href="#!/demographics">Proceed</a>';

        $ctrl.message = { 
          imageUrl:''
          , minHeight:'40em'
          , title:'Welcome to the party!'
          , subtitle:'Thank you for join us!'
          , details:[
            { text: html
              , imageUrl:''
            }
          ]
        }

        angular.forEach($ctrl.message.details, function(detail, i){
          detail.text = $sce.trustAsHtml(detail.text)
        })
      })
  }

  $ctrl.retrieveLoginMessage();

})

sstController.controller('demographicsController', function(Auth){
  var $ctrl = this;
  $ctrl.contact = {};

  $ctrl.retrieveContactInformation = function(){
    Auth.currentIdentity()
        .then(function(response){
          $ctrl.contact = response.contact;
        }, function(error){
          console.log(error);
        })
  }

  $ctrl.retrieveContactInformation();
})

sstController.controller('loginController', function( $scope, 
  $uibModal, 
  $log, 
  $document, 
  $http, 
  $location, 
  $routeParams, 
  Auth,
  Header,
  crypt
){


  $scope.header = Header;


  var $ctrl = this
  $ctrl.content = { 
    video: { 
      poster:'/client/resources/img/IMG_3240.JPG',
      mov:'/client/resources/video/IMG_3212.MOV'
    }
  }
  $ctrl.login = {
    username:undefined, 
    password:undefined
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
        infoTitle: () => $ctrl.infoTitle,
        message: () => $ctrl.message,
        buttons: () => $ctrl.buttons
      }
    });
  }

  $ctrl.submit = function(isValid){
    var passwordHash = crypt.hash($ctrl.login.password)
    Auth.logIn($ctrl.login.username,passwordHash)
    .then(function(response){
      $location.path("/");  
    }, function(error){
      console.log(error);
      $ctrl.infoTitle = 'Access Control'
      $ctrl.message = error.data.message
      $ctrl.buttons = [{
        action: function ($uibModalInstance, model) {
          $uibModalInstance.close('ok');
        }, 
        title:'OK', 
        class:'btn btn-primary btn-lg btn-block'
      }]

      $ctrl.open('lg', '.modal-parent')
    })
  }
})

sstController.controller('contactController', function( $uibModal, 
  $log, 
  $document, 
  $http, 
  $location, 
  $routeParams
){
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

  $ctrl.save = function(isValid) {
      if (isValid === true) {
        $http.post(
        '/api/sst/interaction', 
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

sstController.controller('aboutController', function( $scope, 
  $location, 
  $timeout, 
  $http, 
  $sce, 
  Content
){

  var $ctrl = this
  $ctrl.content = {
    items: []
  }

  Content.about().then(function(response){
    $ctrl.content.items = response.items
    angular.forEach($ctrl.content.items, function(item, i){
      angular.forEach(item.details, function(detail, j){
        detail.text = $sce.trustAsHtml(detail)
      })
    })
  }).catch(function(error){
    console.log(error);
  })

  $ctrl.edit = function(){
    $location.path('/about/edit');
  }
})

sstController.controller('aboutEditController', function( $uibModal, 
  $scope, 
  $location,
  $http, 
  $sce, 
  Content,
  Auth
){

  
  var $ctrl = this
  
  $ctrl.content = {};

  Content.about().then(function(response){
    $ctrl.content.items = response.items

    angular.forEach($ctrl.content.items, function(item, i){
      angular.forEach(item.details, function(detail, j){
        detail.renderedHtml = $sce.trustAsHtml(detail.text)
      })
    })

  }).catch(function(error){
    console.log(error);
    if (error.data.code == 209) {

      Auth.currentIdentity()
      .then(function(response){
        $ctrl.content.createdBy = { _id: response.user._id }

        Content.setAbout($ctrl.content)
        .then((response)=>{
          $ctrl.content.items = response.items
        }).catch((err)=>{

          $ctrl.infoTitle = 'About Edition'
          $ctrl.message = err.data.message
          $ctrl.buttons = [{
            action: function ($uibModalInstance, model) {
              $uibModalInstance.close('ok');
            }, 
            title:'OK', 
            class:'btn btn-danger btn-lg btn-block'
          }]

          $ctrl.open('lg', '.modal-parent')

        })
      }, function(error){
        console.log(error);
        $location.path('/login');
      })
    }
  })


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
        infoTitle: () => $ctrl.infoTitle,
        message: () => $ctrl.message,
        buttons: () => $ctrl.buttons
      }
    });
  }

  $ctrl.renderHtml = function(itemIndex, detailIndex){
    $ctrl.content.items[itemIndex]
      .details[detailIndex]
        .renderedHtml = $sce.trustAsHtml(
          $ctrl.content
            .items[itemIndex]
              .details[detailIndex].text
              );
  }

  $ctrl.save = function(){
    $ctrl.infoTitle = 'About Edition'
    $ctrl.message = "You are about to save the changes made in about contents. Are you sure to proceed?"
    $ctrl.buttons = [{
      action: function ($uibModalInstance, model) {
        Auth.currentIdentity()
          .then(function(response){
            $ctrl.content.modifiedBy = { _id: response.user._id }

            Content.setAbout($ctrl.content)
              .then((response)=>{
                $location.path('/about')
              }).catch((err)=>{

                $ctrl.infoTitle = 'About Edition'
                $ctrl.message = err.data.message + ': ' + err.data.error.data
                $ctrl.buttons = [{
                  action: function ($uibModalInstance, model) {
                    $uibModalInstance.close('ok');
                  }, 
                  title:'OK', 
                  class:'btn btn-danger btn-lg btn-block'
                }]

                $ctrl.open('lg', '.modal-parent')
              })

            $uibModalInstance.close('ok');


          }, function(error){
            console.log(error);
            $location.path('/login');
          })
      }, 
      title:'OK', 
      class:'btn btn-primary btn-lg btn-block'
    },
    {
      action: function ($uibModalInstance, model) {
        $uibModalInstance.close('cancel');
      }, 
      title:'Cancel', 
      class:'btn btn-default btn-lg btn-block'
    }]

    $ctrl.open('lg', '.modal-parent')
  }

  $ctrl.addItem = function(){
    $ctrl.content.items.push({})
    sst().relocateScroll('item_' + ($ctrl.content.items.length - 2))
  }

  $ctrl.removeItem = function(itemIndex){
    $ctrl.infoTitle = 'About Edition'
    $ctrl.message = "You are about to remove the selected item. Are you sure?"
    $ctrl.buttons = [{
      action: function ($uibModalInstance, model) {
        $uibModalInstance.close('ok');
        $ctrl.content.items.splice(itemIndex, 1)
      }, 
      title:'OK', 
      class:'btn btn-danger btn-lg btn-block'
    },
    {
      action: function ($uibModalInstance, model) {
        $uibModalInstance.close('cancel');
      }, 
      title:'Cancel', 
      class:'btn btn-default btn-lg btn-block'
    }]

    $ctrl.open('lg', '.modal-parent')
    
  }

  $ctrl.cancel = function(){
    $ctrl.infoTitle = 'About Edition'
    $ctrl.message = "You are being redirected to the About page. You will lose any unsaved change. Are you sure to continue?"
    $ctrl.buttons = [{
      action: function ($uibModalInstance, model) {
        $uibModalInstance.close('ok');
        $location.path('/about');
      }, 
      title:'OK', 
      class:'btn btn-danger btn-lg btn-block'
    },
    {
      action: function ($uibModalInstance, model) {
        $uibModalInstance.close('cancel');
      }, 
      title:'Cancel', 
      class:'btn btn-default btn-lg btn-block'
    }]

    $ctrl.open('lg', '.modal-parent')
    
  }

  $ctrl.addDetail = function(itemIndex){
    if (!$ctrl.content.items[itemIndex].details) {
      $ctrl.content.items[itemIndex].details = []
    }
    $ctrl.content.items[itemIndex].details.push({})
    var $id = $ctrl.content.items[itemIndex].details.length == 1 ? 
      'item_' + itemIndex :
      'item_' + itemIndex + '_detail_' + ($ctrl.content.items[itemIndex].details.length - 2)
    sst().relocateScroll($id)
  }

  $ctrl.removeDetail = function(itemIndex, detailIndex){
    $ctrl.infoTitle = 'About Edition'
    $ctrl.message = "You are about to remove the selected item. Are you sure?"
    $ctrl.buttons = [{
      action: function ($uibModalInstance, model) {
        $uibModalInstance.close('ok');
        $ctrl.content.items[itemIndex].details.splice(detailIndex, 1)
      }, 
      title:'OK', 
      class:'btn btn-danger btn-lg btn-block'
    },
    {
      action: function ($uibModalInstance, model) {
        $uibModalInstance.close('cancel');
      }, 
      title:'Cancel', 
      class:'btn btn-default btn-lg btn-block'
    }]

    $ctrl.open('lg', '.modal-parent')

  }
})

sstController.controller('modalInstanceController', function ( $uibModalInstance, 
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



