(function(app) {

    var app = angular.module("app", ['ui.router', 'ngTagsInput', 'ngAnimate', 'toastr']);
    app.config(configure).run(runBlock);

    runBlock.$inject = ['$http'];

    function runBlock($http) {


    };
    configure.$inject = ['$httpProvider', '$urlRouterProvider'];

    function configure($httpProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/dashboard')
    }
    app.service('serv', function() {

    });
    app.constant('const', function() {

    });


})(window.app);