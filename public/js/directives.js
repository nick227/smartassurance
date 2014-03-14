'use strict';

/* Directives */

angular.module('myApp.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }).directive('wcUnique', ['dataService', function (dataService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            element.bind('blur', function (e) {
                if (!ngModel || !element.val()) return;
                var keyProperty = scope.$eval(attrs.wcUnique);
                var currentValue = element.val();
                dataService.checkUniqueValue(keyProperty.property, currentValue)
                    .then(function (unique) {
                    	console.log(unique);
                    	console.log('step1');
                    }, function (c) {
                        //Probably want a more robust way to handle an error
                        //For this demo we'll set unique to true though
                        console.log(c);
                        console.log('2step');
                    });
            });
        }
    }
}]);
