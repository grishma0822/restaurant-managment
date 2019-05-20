

  var app = angular.module('app', ['pascalprecht.translate']);

   app.controller('dashboardCtrl',function ($scope,$translate) 
       {
        $scope.changeLanguage = function (key)
        {
         $translate.use(key);
        };
   })

    app.config(function ($translateProvider) {
       $translateProvider.translations('en', {

            "TERMS_CONDITIONS":"TERMS & CONDITIONS",
            "TERMS_LABEL":"TERMS",
           "ZIPCODE_LABEL":"ZIP CODE",
           "LAST_NAME":"Last Name",
           "CONFIRM_LABEL": "Confirm Number ",

        })
       .translations('de', {

                "TERMS_LABEL": "Términos",
                "FORM_LABEL": "Información ",
                "LAST_NAME": "Apellido",
                "ZIPCODE_LABEL": "Código Postal"
       });
        $translateProvider.preferredLanguage('en');
    })