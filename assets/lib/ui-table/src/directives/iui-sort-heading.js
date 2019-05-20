angular.module('iui.sortHeading', [])
.directive('iuiSortHeading', [function () {
  'use strict';
  return {
    restrict: 'E',
    transclude: true,
    scope :{
      iuiSortKey: '@',
      iuiSortBy: '=',
      iuiReverse: '='
    },
    templateUrl: app.root + '$iui-table/templates/iui-sort-heading.html'
  };
}]);