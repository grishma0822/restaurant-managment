(function(angular) {
    'use strict';

    angular.module("app").controller("addRestaurantcntrl", addRestaurantcntrl);
    addRestaurantcntrl.$inject = ["$scope", 'addRestaurantserv', 'toastr'];

    function addRestaurantcntrl($scope, addRestaurantserv, toastr) {
        var vm = this;
        vm.visible = false;

        vm.restaurant = {
            name: "",
            address: "",
            mobileNo: "",
            website: "",
            description: "",
            approxCostForTwo: ""
        };

        getRestaurant();

        function getRestaurant() {
            addRestaurantserv.getRestaurant().then(function(response) {
                vm.restaurants = response.data;
            }, function(error) {
                $scope.status = 'Unable to load customer data: ' + error.message;
            });
        }

        function createGUID() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        };

        vm.save = function() {
            vm.restaurants.push({
                "id": createGUID(),
                "name": vm.restaurant.name,
                "description": vm.restaurant.description,
                "address": vm.restaurant.address,
                "mobileNo": vm.restaurant.mobileNo,
                "website": vm.restaurant.website,
                'approxCostForTwo': vm.restaurant.approxCostForTwo
            })
            addRestaurantserv.saveRestaurant(vm.restaurants).then(function(response) {
                vm.restaurant = {};
                toastr.success('Restaurant Added Successfully', 'ok');
            });
        };
    }
})(window.angular);