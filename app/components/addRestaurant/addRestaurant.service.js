(function(app) {
    angular.module('app').service('addRestaurantserv', addRestaurantserv);

    addRestaurantserv.$inject = ['$http'];

    function addRestaurantserv($http) {
        var urlBase = 'https://api.myjson.com/bins/152c7a';

        this.getRestaurant = function() {
            return $http.get(urlBase);
        };

        this.saveRestaurant = function(detail) {
            return $http.put(urlBase, detail)
        };
    }
})(window.app);