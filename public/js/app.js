'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [
  'ngRoute',
  'ngGrid',
  'ui.bootstrap',
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'angular-momentjs',
  'btford.socket-io'
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/watch', {
      templateUrl: 'partials/activityWatcher',
      controller: 'ActivityWatcherCtrl'
    }).
    when('/build/:id', {
      templateUrl: 'partials/ruleBuilder',
      controller: 'RuleBuilderCtrl'
    }).
    when('/build', {
      templateUrl: 'partials/ruleBuilder',
      controller: 'RuleBuilderCtrl'
    }).
    when('/construct', {
      templateUrl: 'partials/correlationBuilder',
      controller: 'CorrelationConstructorCtrl'
    }).
    otherwise({
      redirectTo: '/watch'
    });

  $locationProvider.html5Mode(true);
});
