'use strict';
var socialSTechnologiesApp = angular.module('socialSTechnologiesApp', [
 'ngRoute',
 'sstComponent', 
 'sstController'
])

socialSTechnologiesApp.config(['$routeProvider', 
 function($routeProvider){
  $routeProvider.when('/', {
   templateUrl: '/client/partials/default.html',
  }).when('/home', {
   templateUrl: '/client/partials/home.html',
  }).when('/contact', {
   templateUrl: '/client/partials/contact.html',
  }).when('/about', {
   templateUrl: '/client/partials/about.html',
  }).otherwise('/')
}])