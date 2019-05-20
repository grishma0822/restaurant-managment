(function(angular) {
    'use strict';

    angular.module("app").controller("restaurantListcntrl", restaurantListcntrl);
    restaurantListcntrl.$inject = ["$scope", 'restaurantserv', 'toastr'];

    function restaurantListcntrl($scope, restaurantserv, toastr) {
        var vm = this;
        vm.visible = false;

        vm.restaurant = {};

        vm.isEdit = false;

        getRestaurant();

        function getRestaurant() {
            restaurantserv.getRestaurant().then(function(response) {
                vm.restaurants = response.data;
            }, function(error) {
                $scope.status = 'Unable to load restaurant detail: ' + error.message;
            });
        }
    }

})(window.angular);