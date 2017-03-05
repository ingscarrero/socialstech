'use strict';
var socialSTechnologiesApp = angular.module('socialSTechnologiesApp', [
 'ngRoute',
 'sstComponent', 
 'sstController'
])

socialSTechnologiesApp.config(['$routeProvider', 
 function($routeProvider){
  $routeProvider.when('/home', {
   templateUrl: '/partials/home.html',
   controller: 'homeController'
  }).when('/contact', {
   templateUrl: '/partials/contact.html',
   controller: 'contactController'
  }).when('/about', {
   templateUrl: '/partials/about.html',
   controller: 'aboutController'
  }).otherwise({redirectTo:'/home'})
}])