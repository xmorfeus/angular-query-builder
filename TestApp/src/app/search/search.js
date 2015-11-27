angular.module('search', ['ui.router'])
.controller( 'SearchCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
	$rootScope.$ListService.init('search', undefined, true);
}])

.controller( 'AdvancedSearchCtrl', ['$scope', '$rootScope', 'DocumentsResource', 'utilityService', '$modal', '$filter', '$translate', '$state', '$stateParams',
                                    function($scope, $rootScope, DocumentsResource, utilityService, $modal, $filter, $translate, $state, $stateParams) {
     
	$rootScope.$ListService.init('advancedsearch');

     if (angular.isDefined($rootScope.$ListService.advancedFilter)) {
         $scope.filter = $rootScope.$ListService.advancedFilter;
         $scope.fields = computed($scope.filter.group);
     }
     else {

         $scope.filter = {"group": {"operator": "AND","rules": []}};
     }

     $scope.configurations = [];
     $scope.defaultConf = undefined;
     if(angular.isUndefined($rootScope.cache.advancedsearch)) {
    	$rootScope.cache.advancedsearch = {};
     }

     DocumentsResource.advancedSearchConfs({}, function(response) {
    	$scope.mapToList(response.values, false).then(function(param) {
    		 $scope.configurations = param;
    		 $scope.loadTemplate($stateParams.selected);
		 });
     }, function(error) {
    	$rootScope.$MessageService.writeException(error);
     });

     $scope.loadTemplate = function(type) {
    	if(angular.isUndefined(type)) {
    		 $scope.selectedConf = $scope.configurations[0];
    		 type = $scope.selectedConf.id;
    	} else {
    		 $scope.selectedConf = _.findWhere($scope.configurations, {id: type});
    	}
    	if($rootScope.cache.advancedsearch[type]) {
    		 $scope.formTemplate = $rootScope.cache.advancedsearch[type].template;
    		 
    	} else {
    		 DocumentsResource.advancedSearchConf({conf: type}, function(response) {
                 $rootScope.fields = response[$filter('filter')(_.allKeys(response), 'form', false)[0]][0].controls;

    			 $rootScope.cache.advancedsearch[type] = {template : $rootScope.fields};

                 console.log($rootScope.fields);

    		 }, function(error) {

    			 $rootScope.$MessageService.writeException(error);
    		 });
    	}
     }

     $scope.loadForm = function (item, model) {

         $rootScope.$ListService.advancedFilter = undefined;
         $rootScope.$ListService.advancedTemplate = undefined;

         $state.go('dashboard.advancedsearch', {selected: item.id});

     };

     $scope.sendForm = function () {
         $rootScope.$ListService.advancedSearchFind($scope.filter, $scope.output);

     };

    function computed(group) {
        if (!group) return "";
        for (var str = "(", i = 0; i < group.rules.length; i++) {



            i > 0 && (str += " " + group.operator + " ");

            if (group.rules[i].group) {
                str += computed(group.rules[i].group);
            }
            else {

                if (angular.isUndefined(group.rules[i].field.name)) {
                    str += "--??-- "
                }
                else{
                    // DQL any parametr
                    if (group.rules[i].field.repeating) {
                        str += 'ANY '
                    }

                    if (group.rules[i].field.control_type !== 'singleselectbase') {
                        str += group.rules[i].field.name + " ";
                    }
                }

                if (angular.isUndefined(group.rules[i].condition.id)) {
                    str += "--??-- "
                }
                else {

                    switch (group.rules[i].condition.id) {
                        case 'like':
                        case 'startwith':
                        case 'endwith':
                            str += 'like '
                            break;

                        case 'notlike':
                            str += 'not like '
                            break;
                        default:
                            if (group.rules[i].field.control_type !== 'singleselectbase') {
                                str += group.rules[i].condition.id + " ";
                            }
                    }

                }

                if (angular.isUndefined(group.rules[i].data)) {

                    if (group.rules[i].field.control_type === "checkbox") {
                        str += "false "
                    }
                    else {
                        str += "--??-- "
                    }

                }
                else {

                    switch (group.rules[i].field.control_type) {
                        case 'singleselectbase':
                        case 'singleselecttree':
                        case 'multiselect':
                            var d = group.rules[i].data.map(function (obj) {
                                if (group.rules[i].field.type === "String") {
                                    if (angular.isDefined(obj.name)) {
                                        return "\"" + obj.name + "\"";
                                    }
                                    else {
                                        return "\"" + obj.value + "\"";
                                    }
                                }
                                else {
                                    if (angular.isDefined(obj.name)) {
                                        return obj.name;
                                    }
                                    else {
                                        return obj.value;
                                    }
                                }
                            });

                            if (group.rules[i].field.control_type === 'singleselectbase') {
                                str += 'folder';
                            }

                            str += '(' + d.join() + ')';

                            break;
                        case 'singleselect':
                            if (group.rules[i].field.type === "String") {
                                str += '(\'' + group.rules[i].data.id + '\')';
                            }
                            else {
                                str += '(' + group.rules[i].data.id + ')';
                            }

                            break;
                        case 'datetimepickup':
                            str += 'date(\'' + moment(group.rules[i].data.toString(), ["DD.MM.YYYY", moment.ISO_8601, "ddd MMM D YYYY HH:mm:ss [GMT]ZZ", "x"]).format("DD.MM.YYYY") + '\')';
                            break;
                        case 'checkbox':

                            str += group.rules[i].data;
                            break;
                        default:

                            switch (group.rules[i].condition.id) {
                                case 'like':
                                case 'notlike':
                                    str += '\'%' + group.rules[i].data + '%\'';
                                    break;
                                case 'startwith':
                                    str += '\'' + group.rules[i].data + '%\'';
                                    break;
                                case 'endwith':
                                    str += '\'%' + group.rules[i].data + '\'';
                                    break;
                                default:
                                    if (group.rules[i].field.type === "String") {
                                        str += '\'' + group.rules[i].data + '\'';
                                    }
                                    else {
                                        str += group.rules[i].data;
                                    }
                            }


                    }
                }

            }
        }

        return str + ")";
    }

    $scope.json = null;


    $rootScope.fields = {};

    $scope.$watch('filter', function (newValue) {

        $rootScope.$ListService.advancedFilter = newValue;
        $scope.json = JSON.stringify(newValue, null, 2);
        $scope.output = computed(newValue.group);
    }, true);

}]);

  