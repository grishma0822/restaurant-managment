(function(app) {
    angular.module('app').service('restaurantserv', restaurantserv);

    restaurantserv.$inject = ['$http'];

    function restaurantserv($http) {
        var urlBase = 'https://api.myjson.com/bins/152c7a'

        this.getRestaurant = function() {
            return $http.get(urlBase);
        };
    }
})(window.app);