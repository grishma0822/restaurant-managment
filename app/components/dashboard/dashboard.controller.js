(function(angular) {
    'use strict';

    angular.module("app").controller("dashboardcntrl", dashboardcntrl);
    dashboardcntrl.$inject = ["$scope", 'dashboardserv', 'toastr'];

    function dashboardcntrl($scope, dashboardserv, toastr) {
        var vm = this;

        getRestaurant();

        function getRestaurant() {
            dashboardserv.getRestaurant().then(function(response) {
                vm.restaurants = response.data;
            }, function(error) {
                $scope.status = 'Unable to load restaurant detail: ' + error.message;
            });
        }
    }

})(window.angular);