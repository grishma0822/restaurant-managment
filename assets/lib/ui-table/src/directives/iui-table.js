/*doc
---
title: iui-table
name: iui-table
category: directives
---

Adding the iui-table directive to your markup:

```js_example
app.controller('TableController', [function () {
  var that = this;
  that.data = [
    {
      firstName: 'Joe',
      lastName: 'Smith'
    },
    {
      firstName: 'Janet',
      lastName: 'Doe'
    }
  ];
  that.gridColumns = [
    {
      field: 'firstName',
      displayName: 'First Name',
      columnClass: 'table-column-first-name'
    },
    {
      field: 'lastName',
      displayName: 'Last Name'
      //headerCellTemplate: 'templates/url-of-header-template.html'
    }
  ];
  that.sortingOptions = {
    field: 'lastName',
    reverse: false
  };
}]);
```

```html_example
<div ng-controller="TableController as table">
  <iui-table 
    display-columns="table.gridColumns" 
    row-data="table.data" 
    hide-table-pager="false" 
    sorting-options="table.sortingOption" 
    table-class="'table-names responsive'" 
    table-caption="'Table of Names'"
    hide-table-caption="false"
    page-size="10"
    server-side-sorting="false"></iui-table>
</div>
```

## Directive Attributes

<dl class="dl-horizontal dt-as-left-aligned short-list">
  <dt>displayColumns</dt>
  <dd><code>Array</code> <b>Required</b> - defines the columns in the grid</dd>
  <dt>rowData</dt>
  <dd><code>Array</code> <b>Required</b> - array of data. Only the fields defined in the displayColumns will show</dd>
  <dt>hideTablePager</dt>
  <dd><code>Boolean</code> - determines if the pagination at the bottom should show</dd>
  <dt>rowTemplate</dt>
  <dd><code>String</code> - allows a custom row template to be passed in</dd>
  <dt>sortingOptions</dt>
  <dd><code>Object</code> - with two properties field: <code>String</code> and reverse: <code>Boolean</code></dd>
  <dt>tableCaption</dt>
  <dd><code>String</code> - gives the table a caption</dd>
  <dt>hideTableCaption</dt>
  <dd><code>Boolean</code> - puts a class of sr-only on the table caption. That way the heading is still visible to screen readers</dd>
  <dt>tableClass</dt>
  <dd><code>String</code> - passes in class to table. You can chain table classes like 'class1 class2'</dd>
  <dt>pageSize</dt>
  <dd><code>Counting Number</code> - defaults to 10</dd>
  <dt>serverSideSorting</dt>
  <dd><code>Boolean</code> - if there is server side sorting set to true</dd>
</dl>

*/


angular.module('iuiTable', ['iui.pager', 'iui.sortHeading', 'startFrom'])
.directive('iuiTable', [function () {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: app.root + '$iui-table/templates/iui-table.html',
    scope: true,
    link: function(scope, element, attrs) {
      scope.iuiTable = {};
      scope.iuiTable.settings = {};

      scope.iuiTable.settings.defaultRowTemplate = app.root + '$iui-table/templates/iui-table-default-row.html';
      scope.iuiTable.settings.defaultHeaderCellTemplate = app.root + '$iui-table/templates/iui-table-header-cell.html';

      scope.iuiTable.pagingOption = {
        currentPage: 1,
        pageSize: 10
      };
      scope.iuiTable.pagingOption.currentPage = 1;

      scope.$watch(attrs.displayColumns, function(newVal) {
        scope.iuiTable.displayColumns = newVal;
      });
      scope.$watch(attrs.rowData, function(newVal) {
        scope.iuiTable.rowData = newVal;
      });
      scope.$watch(attrs.tableCaption, function(newVal) {
        scope.iuiTable.tableCaption = newVal;
      });
      scope.$watch(attrs.hideTableCaption, function(newVal) {
        scope.iuiTable.hideTableCaption = newVal;
      });
      scope.$watch(attrs.hideTablePager, function(newVal) {
        scope.iuiTable.hideTablePager = newVal;
      });
      scope.$watch(attrs.rowTemplate, function(newVal) {
        scope.iuiTable.rowTemplate = newVal;
      });
      scope.$watch(attrs.tableClass, function(newVal) {
        scope.iuiTable.tableClass = newVal;
      });

      scope.$watch(attrs.pageSize, function(newVal) {
        scope.iuiTable.pagingOption.pageSize = newVal || scope.iuiTable.pagingOption.pageSize;
      });

      scope.iuiTable.sortingOptions = scope.$parent.$eval(attrs.sortingOptions);

      scope.$watch(attrs.serverSideSorting, function(newVal) {
        scope.iuiTable.serverSideSorting = newVal;
      });

      scope.iuiTable.selectedItems = scope.$parent.$eval(attrs.selectedItems);
      // Selected items array builder
      scope.determineSelectedItems = function() {
        scope.iuiTable.selectedItems = [];
        _.each(scope.iuiTable.rowData, function(column) {
          if (column.selected === true) {
            scope.iuiTable.selectedItems.push(column);
          }
        });
      };

      // Add checkbox functionality. This function iterates through the
      // gridColumn data and finds the ng-model of column.selected and
      // assigns truth to the selectedAll object.
      scope.checkAll = function() {
        scope.selectedAll = !scope.selectedAll;
        _.filter(scope.iuiTable.rowData, function(column) {
          column.selected = scope.selectedAll;
        });
        scope.determineSelectedItems();
      };
      //  If all checkboxes are selected, then check the table header checkbox
      scope.isAllSelected = function() {
        scope.selectedAll = _.every(scope.iuiTable.rowData, function(column) {
          return column.selected;
        });
        scope.determineSelectedItems();
      };
    }
  };
}]);
