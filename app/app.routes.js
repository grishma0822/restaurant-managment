(function(app) {
    'use strict';
    var configure = ['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('app', {
                cache: true,
                views: {
                    '': {
                        templateUrl: "app/components/landing/landing.html"
                    },

                    'header@app': {
                        templateUrl: 'app/shared/layout/header.html',
                        controller: 'headercntrl as $head'
                    },
                    'footer@app': {
                        templateUrl: 'app/shared/layout/footer.html'

                    }
                }
            })
            .state('app.restaurant', {
                display_name: 'Components',
                url: '/restaurant',
                cache: true,
                views: {
                    'pagecontent': {
                        templateUrl: 'app/components/restaurantList/restaurantList.html',
                        controller: 'restaurantListcntrl as $prdct'
                    }
                }

            })

            .state('app.dashboard', {
                display_name: 'Components',
                url: '/dashboard',
                cache: true,
                views: {
                    'pagecontent': {
                        templateUrl: 'app/components/dashboard/dashboard.html',
                        controller: 'dashboardcntrl as $dact'
                    }
                }
            })

            .state('app.addRestaurant', {
                display_name: 'Components',
                url: '/add-restaurant',
                cache: true,
                views: {
                    'pagecontent': {
                        templateUrl: 'app/components/addRestaurant/addRestaurant.html',
                        controller: 'addRestaurantcntrl as $adrs'
                    }
                }
            })
    }]


    var run = ['$rootScope', '$state', '$urlRouter', '$timeout', function($rootScope, $state, $urlRouter, $timeout) {

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            if (fromState.url == toState.url) {
                event.preventDefault();
            }
        });
    }];

    angular.module('app').run(run);

    angular.module('app').config(configure);

})(window.app);