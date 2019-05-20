/**
 * @author michael.ash
 * Creates a pager for items in a data table.  Uses the startOffset and limitTo filters.
 * Define the collection in the parent scope as an empty arry
 * Watch the collection in the parent scope
 * Initialize  the page property in the parent scope to 1
 * Set the pageSize property in the parent scope.
 */
angular.module('iui.pager', [])
.directive('iuiPager', function () {
  'use strict';
  return {
    restrict : 'E',
    replace : true,
    scope : {
      page :  '=',
      pageSize : '=',
      totalRecords : '='
    },
    templateUrl : '/$iui-table/templates/iui-pager.html',
    link : function(scope, element, attrs){
      scope.componentId = attrs.id;
      scope.$watch('totalRecords', function(){
        if (scope.page > scope.pageCount()) {
          scope.getFirstPage();
        }
      });
      scope.total = function(){
        var result = -1,
          count = parseInt(scope.totalRecords,10);
        if (!isNaN(count)){
          result = count;
        }
      };
      scope.currentPage = function () {

        var result = 1,
          page = scope.page;
        if (!isNaN(page)){
          result = page;
        }
        return result;
      };
      scope.page = scope.pageNum = scope.currentPage();

      scope.getFirstPage = function(){
        scope.page = scope.pageNum = 1;
      };
      scope.getPreviousPage = function(){
        scope.page = scope.pageNum = scope.page - 1;
      };
      scope.getNextPage = function(){
        scope.page = scope.pageNum = scope.page + 1;
      };
      scope.getLastPage = function(){
        scope.page = scope.pageNum = scope.pageCount();
      };
      scope.hasNoMore = function (){
        return (scope.page >= scope.pageCount());
      };
      scope.hasNoPrevious = function (){
        return (scope.page <= 1);
      };
      scope.hasNoPages = function (){
        return (scope.pageCount() < 2);
      };
      scope.jumpToPage = function (pageNum) {
        if (!isNaN(pageNum) && pageNum > 0 && pageNum % 1 === 0 && pageNum <= scope.pageCount()){
          scope.page = pageNum;
        } else {
          return;
        }
      };
      scope.goToPage = function (){
        var pageNumber = element.find('input[type=number]'),
            num = parseInt(pageNumber.val(),10);
        scope.page = num;
      };
      scope.pageCount = function() {
        return Math.ceil(scope.totalRecords / scope.pageSize);
      };
    }
  };
});