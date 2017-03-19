'use strict';
var socialSTechnologiesApp = angular.module('socialSTechnologiesApp', [
  'ngRoute',
  'ngMessages',
  'ngSanitize',
  'sstService',
  'sstDirective',
  'sstComponent',
  'utilityController',
  'publicController',
  'sstController'
])

socialSTechnologiesApp.factory('crypt', function () {
  return {
    hash: function (value) {
      var str = JSON.stringify(value);
      return CryptoJS.SHA256(str).toString();
    }
  };
});

socialSTechnologiesApp.service('identity', function () {
  //this.token = undefined;

  return {
    token: {
      get: function () {
        return $.parseJSON(sessionStorage.getItem('token'));
      },
      set: function (token) {
        if (token) {
          sessionStorage.setItem('token', JSON.stringify(token));
        } else {
          sessionStorage.removeItem('token');
        }
      }
    }
  }
})

socialSTechnologiesApp.factory('Header', function () {
  return {
    user: undefined,
    title: 'Social Solutions Technologies',
    menu: {
      items: [{
          action: "#!/home",
          title: "Home"
        },
        {
          action: "#!/about",
          title: "About"
        },
        {
          action: "#!/contact",
          title: "Contact"
        }
      ],
      activeItem: undefined
    }
  }
})

socialSTechnologiesApp.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: '/client/partials/default.html',
    }).when('/home', {
      templateUrl: '/client/partials/home.html',
    }).when('/contact', {
      templateUrl: '/client/partials/contact.html',
      requiresSSL: true
    }).when('/about', {
      templateUrl: '/client/partials/about.html',
    }).when('/login/', {
      templateUrl: '/client/partials/login.html',
      requiresSSL: true
    }).when('/admin', {
      templateUrl: '/client/partials/admin.html',
      requiresSSL: true
    }).when('/signup/:action', {
      templateUrl: '/client/partials/activity-confirm.html',
      requiresSSL: true
    }).when('/account/activate/:activation_request', {
      controller: 'activationController',
      requiresSSL: true,
      template: ''
    }).when('/account/elevate/:elevation_request', {
      templateUrl: '/client/partials/account-elevation.html',
      requiresSSL: true,
      requiresAuthentication: true,
    }).when('/activation/:action', {
      templateUrl: '/client/partials/activity-confirm.html',
      requiresSSL: true
    }).when('/signup', {
      templateUrl: '/client/partials/signup.html',
      requiresSSL: true
    }).when('/home/edit', {
      templateUrl: '/client/partials/home-edit.html',
      requiresSSL: true
    }).when('/about/edit', {
      templateUrl: '/client/partials/about-edit.html',
      requiresSSL: true
    }).when('/demographics', {
      templateUrl: '/client/partials/demographics.html',
      requiresSSL: true
    }).otherwise('/')
  }
])

socialSTechnologiesApp.run(function ($rootScope,
  $http,
  $location,
  $window,
  Auth,
  Header) {

  $rootScope.$on('$routeChangeStart', function (event, next) {

    Auth.isResourceAllowed(next).then((result) => {

      if (result === false) {
        var redirectTo = encodeURIComponent($location.$$path);
        $location.path('/login').search('url_redirect', redirectTo)
        $scope.apply();
      } else if (next.requiresSSL && $location.protocol() !== 'https') {
        var newLocation = $location.absUrl().por
        $window.location.href = $location.absUrl().replace('http', 'https').replace(3000, 4000);
      }

    }).catch((err) => {
      console.log(err);
    })
  })

  $rootScope.$on('$routeChangeSuccess', function ($scope, event) {

    $scope.header = Header;

    function setActiveItemForPath(path) {

      $scope.header.menu.activeItem = undefined
      angular.forEach($scope.header.menu.items, function (item, i) {
        if (item.action.substring(item.action.indexOf('/')) == path) {
          $scope.header.menu.activeItem = item
        }
      })
    }

    function retrieveUserInformation() {
      Auth.currentIdentity()
        .then(function (response) {
          var nameComponents = response.contact.fullName.split(' ');
          var shortName = nameComponents ? nameComponents[0] : response.user.name;
          $scope.header.user = response.user
          $scope.header.contact = {
            fullName: response.contact.fullName,
            shortName: shortName
          }
        }, function (error) {
          $scope.header.user = undefined
          console.log(error);
        })
    }

    setActiveItemForPath($location.$$path);
    retrieveUserInformation();
  })
})