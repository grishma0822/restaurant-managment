(function (angular) {
   'use strict';

   	angular.module('app').directive('xcdInput', xcdInput);

    xcdInput.$inject = ['$timeout'];

    function xcdInput($timeout) {	
		return {
			restrict: "E",
	        require: '?ngModel',
			scope: {
                inputData: '=',
                type: '=',
                isDisabled: '=',
                focused: '&',
                blurred: '&',
                changed: '&'
            },
			link: function(scope, Elm, Attrs, ngModel) {

                //scope.type = Attrs.type;   
                scope.dropdownData = scope.inputData;

                if(scope.type == 'text'){
                    scope.isText = true;
                }else if(scope.type == 'number'){
                    scope.isNumber = true;
                }else if(scope.type == 'date'){
                    scope.isDate = true;
                }else if(scope.type == 'select'){
                    scope.isSelect = true;
                }else if(scope.type == 'checkbox'){
                    scope.isCheckbox = true;
                }else if(scope.type == 'view'){
                    scope.isView = true;
                }

                if (!ngModel) return;

                scope.onChange = function(){
                    ngModel.$setViewValue(scope.value);
                    scope.changed();
                };

                scope.onSelectChange = function(selected){
                    ngModel.$setViewValue(selected);
                    $timeout(function() {
                        scope.changed(selected);
                    }, 30);
                    
                };

                scope.onFocus = function(event){
                    ngModel.$setViewValue(scope.value);
                    scope.focused();
                    angular.element(event.target).parent().addClass('xcd-input-focused');
                };

                scope.onBlur = function(event){
                    ngModel.$setViewValue(scope.value);
                    scope.blurred(); 
                    angular.element(event.target).parent().removeClass('xcd-input-focused');
                };

                function handleSelect(){
                    if(scope.dropdownData){
                        scope.drops = scope.dropdownData;
                        if(ngModel.$modelValue != undefined){
                            _.forEach(scope.drops, function(value, key){
                               if(value.value == ngModel.$modelValue){
                                    scope.index = value.id;
                               } 
                            });
                        }else{
                            scope.index = 0;
                        }
                        scope.selected = scope.drops[scope.index]
                    }
                };

                ngModel.$render = function(){
                    if(scope.type == 'date'){
                        scope.value = new Date(ngModel.$modelValue);
                    }else{
                        scope.value = ngModel.$modelValue;
                    }
                    if(scope.type == 'select'){
                        handleSelect();
                    }
                };
                
        	},
        	template: "<div class='xcd-input-block' ng-if='isText'>"+
                //"<label ng-bind='label'></label>"+
                "<input type='text' ng-model='value' ng-disabled='isDisabled' ng-change='onChange()' ng-blur='onBlur($event)' ng-focus='onFocus($event)'>"+
                "</div>"+
                "<div class='xcd-input-block' ng-if='isNumber'>"+
                //"<label ng-bind='label'></label>"+
                "<input type='number' ng-model='value' ng-disabled='isDisabled' ng-change='onChange()' ng-blur='onBlur($event)' ng-focus='onFocus($event)'>"+
                "</div>"+
                "<div class='xcd-input-block' ng-if='isDate'>"+
                //"<label ng-bind='label'></label>"+
                "<input type='date' ng-model='value' ng-disabled='isDisabled' ng-change='onChange()' ng-blur='onBlur($event)' ng-focus='onFocus($event)'>"+
                "</div>"+
                '<div class="xcd-input-block" ng-if="isSelect">'+
                //"<label ng-bind='label'></label>"+
                "<select ng-options = 'drop as drop.displayName for drop in drops track by drop.value' ng-model='selected' ng-disabled='isDisabled' ng-change='onSelectChange(selected)' ng-blur='onBlur($event)' ng-focus='onFocus($event)'>"+
                "</select>"+
                "</div>"+
                "<div class='xcd-input-block' ng-if='isCheckbox'>"+
                //"<label ng-bind='label'></label>"+
                '<input type="checkbox" ng-model="value" ng-disabled="isDisabled" ng-true-value="'+"'Y'"+'" ng-false-value="'+"'N'"+'" ng-change="onChange()" ng-blur="onBlur($event)" ng-focus="onFocus($event)">'+
                "</div>"+
                "<div class='xcd-input-block' ng-if='isView'>"+
                //"<label ng-bind='label'></label>"+
                '<span ng-bind="value"></span>'+
                "</div>"
		}
	}
	
})(window.angular);