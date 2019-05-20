angular.module('startFrom', [])
.filter('startFrom', function() {
  'use strict';
  return function(input, start) {
    if (input) {
      start = +start; //parse to int
      return input.slice(start);
    }
  };
});
