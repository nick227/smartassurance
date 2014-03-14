'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  factory('socket', function (socketFactory) {
    return socketFactory();
  }).
  value('version', '0.1').
  factory('dataService', ['$http', function ($http) {
        var serviceBase = '/api/',
            dataFactory = {};

        dataFactory.checkUniqueValue = function (property, value) {
            return $http.get(serviceBase + 'checkName/' + escape(value)).then(
                function (results) {
                    return results;
                });
        };

        return dataFactory;

}]);
