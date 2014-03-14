'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('interpolate', function (version) {
    return function (text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }).
  filter('cleanField', function () {
    return function (text) {
      return String(text).replace('_', ' ').replace('@', '');
    }
  });
