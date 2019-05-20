(function(app) {
    angular.module('app').service('dashboardserv', dashboardserv);

    dashboardserv.$inject = ['$http'];

    function dashboardserv($http) {
        var urlBase = 'https://api.myjson.com/bins/152c7a';

        this.getRestaurant = function() {
            return $http.get(urlBase);
        };
    }
})(window.app);