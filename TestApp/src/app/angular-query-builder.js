angular.module('queryBuilder', [])
    .directive('queryBuilder', ['$compile', '$rootScope', '$modal', 'CodeTablesResource', '$parse',
        function ($compile, $rootScope, $modal, CodeTablesResource, $parse ) {

    return {
        restrict: 'E',
        scope: false,
        //scope: {
        //    group: '=',
        //    fields: '='
        //},
        templateUrl: '/queryBuilderDirective.html',
        compile: function (element, attrs) {
            var content, directive;
            content = element.contents().remove();
            return function ($scope, element, attrs) {

                $scope.group = $parse(attrs.group)($scope);

                //if (angular.isUndefined($rootScope.fields)) {
                    $rootScope.fields = $parse(attrs.fields)($scope);
                //}


                $scope.operators = [
                    { name: 'AND' },
                    { name: 'OR' }
                ];

                $scope.opened = [];

                $scope.conditions = [];

                $scope.dateOptions = {
                    formatYear: 'yy',
                    startingDay: 1,
                    showWeeks:'false',
                    showButtonBar: 'false',
                    formatDay: 'd',
                    //formatDayHeader: '',
                    formatDayTitle: 'MMMM yyyy',
                    formatMonth: 'MMMM',
                    formatMonthTitle: 'y'
                };

                $scope.format = 'dd.MM.yyyy';


                $scope.loadData = function(field) {

                    if (angular.isUndefined(field.values) && angular.isDefined(field.codetable)) {

                        CodeTablesResource.list({
                            codetable: field.codetable,
                            id: 'root',
                            nodes: 'nodes'
                        }, function (response) {

                            if (response.data != undefined) {
                                field.values = response.data;
                            }
                            else {
                                field.values = [response];
                            }

                        }, function (error) {
                            field.values = [];
                        });
                    }
                }

                //$scope.$watch('fields', function (newValue) {
                //    //angular.forEach($rootScope.fields, function(value, key) {
                //    //    if (angular.isDefined(value.codetable) && angular.isUndefined(value.values)) {
                //    //
                //    //        CodeTablesResource.list({
                //    //            codetable: value.codetable,
                //    //            id: 'root',
                //    //            nodes: 'nodes'
                //    //        }, function (response) {
                //    //
                //    //            if (response.data != undefined) {
                //    //                value.values = response.data;
                //    //            }
                //    //            else {
                //    //                value.values = [response];
                //    //            }
                //    //            //if (angular.isUndefined($scope.dataOptions)) {
                //    //            //    $scope.dataOptions = {};
                //    //            //}
                //    //            //$scope.dataOptions[name] = $scope.portals;
                //    //
                //    //        }, function (error) {
                //    //            value.value = [];
                //    //        });
                //    //    }
                //    //});
                //}, true);



                $scope.addCondition = function () {
                    $scope.group.rules.push({
                        condition: $rootScope.fields[0].options[0],
                        field: $rootScope.fields[0]
                        //,
                        //data: ''
                    });
                };

                $scope.removeCondition = function (index) {
                    $scope.group.rules.splice(index, 1);
                };

                $scope.addGroup = function () {
                    $scope.group.rules.push({
                        group: {
                            operator: 'AND',
                            rules: []
                        }
                    });
                };

                $scope.removeGroup = function () {
                    "group" in $scope.$parent && $scope.$parent.group.rules.splice($scope.$parent.$index, 1);
                };

                $scope.openDate = function ($event, name) {

                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.opened[name] = true;
                };



                $scope.openTreeModal = function (formData, dataOptions, size, name, codetable, multi, folder, form, label, typeNodes) {

                    var modalInstance = $modal.open({
                        animation: true,
                        templateUrl: 'documents/treeModal.tpl.html',
                        controller: 'TreeModalCtrl',
                        size: 'lg',
                        resolve: {
                            origSelected: function () {
                                return formData.data;
                            },
                            codetable: function () {
                                return codetable;
                            },
                            name: function () {
                                return name;
                            },
                            options: function () {
                                return [];
                            },
                            multi: function () {
                                return multi;
                            },
                            folder: function () {
                                return folder;
                            },
                            label: function () {
                                return label;
                            },
                            typeNodes: function () {
                                return typeNodes;
                            }
                        }
                    });
                    modalInstance.result.then(function (selectedItem) {
                        formData.data = selectedItem;
                    }, function () {
                    });
                };

                $scope.openBaseModal = function (name, formData, label, files_api, search_api, rootfolder_api, folder_select, multi_select) {

                    var modalInstance = $modal.open({
                        animation: true,
                        controller: 'BaseSelectCtrl',
                        templateUrl: 'documents/baseModal.tpl.html',
                        scope: $scope,
                        size: 'lg'
                        ,
                        resolve: {
                            origSelected: function () {
                                return formData.data;
                            },
                            label: function () {
                                return label;
                            },
                            type: function () {
                                return [];//"image"
                            },
                            files_api: function () {
                                return files_api
                            },
                            search_api: function () {
                                return search_api
                            },
                            rootfolder_api: function () {
                                return rootfolder_api
                            },
                            folder_select: function () {
                                return (angular.isDefined(folder_select) && folder_select !== "undefined") ? folder_select : false;
                            },
                            multi_select: function () {
                                return (angular.isDefined(multi_select) && multi_select !== "undefined") ? multi_select : false;
                            },
                            only_can_workflow: function() {
                                return false;
                            }
                        }
                    });

                    modalInstance.result.then(function (selectedItem) {

                        formData.data = selectedItem;
                    }, function () {
                    });
                };

                $scope.remove = function(node, name, data) {
                    var index = data.indexOf(node);
                    data.splice(index, 1);
                    data = angular.copy(data);
                };

                $rootScope.text = function(group){
                    var result = '(';
                    var op = '';
                    for (var i = 0; i < group.rules.length; i++){


                        var child = group.rules[i];

                        if (angular.isDefined(child.group)) {
                            result += $rootScope.text(child.group);
                        }
                        else {
                            result += child.field.name + ' ' + child.condition.name + ' ' + child.data;
                        }

                        if ((i + 1) < group.rules.length) {
                            result += ' ' + group.operator + ' ';
                        }
                    }
                    return result += ')';
                };

                directive || (directive = $compile(content));

                element.append(directive($scope, function ($compile) {
                    return $compile;
                }));
            }
        }
    }
}]);