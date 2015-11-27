angular.module('dynamicForm', [])
    .directive('dynamicForm', ['$q', '$parse', '$http', '$templateCache', '$rootScope', '$compile', '$document', '$timeout', '$filter', 'CodeTablesResource', 'ContentResource', 'utilityService', '$translate', 'x2js', '$state', '$stateParams'
        , function ($q, $parse, $http, $templateCache, $rootScope, $compile, $document, $timeout, $filter, CodeTablesResource, ContentResource, utilityService, $translate, x2js, $state, $stateParams) {
        var controls = {
            //Controls
            'group': {editable: false},
            'sub_group': {editable: false},
            'groupwithcheckbox': {editable: false, groupBased: true},
            'textinput': {editable: true, textBased: true},
            'numberinput': {editable: true},
            'textarea': {editable: true, textBased: true},
            'checkbox': {editable: true},
            'singleselect': {editable: true},
            'multiselect': {editable: true},
            'multiselecttree': {editable: true},
            'singleselecttree': {editable: true},
            'singleselectbase': {editable: true},
            'multiselectautocomplete': {editable: true},
            'datepickup': {editable: true},
            'datetimepickup': {editable: true},
            'submit': {editable: true},
            'editor': {editable: true}
        };

        var supported = {
            //  Text-based elements
            'text': {element: 'input', type: 'text', editable: true, textBased: true},
            'String': {element: 'input', type: 'text', editable: true, textBased: true},

            'date': {element: 'input', type: 'date', editable: true, textBased: true},
            'Date': {type: 'datetime', editable: true, textBased: false},

            'datetime': {element: 'input', type: 'datetime', editable: true, textBased: true},
            'datetime-local': {element: 'input', type: 'datetime-local', editable: true, textBased: true},
            'email': {element: 'input', type: 'email', editable: true, textBased: true},
            'month': {element: 'input', type: 'month', editable: true, textBased: true},

            'number': {element: 'input', type: 'number', editable: true, textBased: true},
            'Number': {element: 'input', type: 'text', editable: true, textBased: true},

            'boolean': {element: 'input', type: 'boolean', editable: true, textBased: true},
            'Boolean': {element: 'input', type: 'boolean', editable: true, textBased: true},

            'password': {element: 'input', type: 'password', editable: true, textBased: true},
            'search': {element: 'input', type: 'search', editable: true, textBased: true},
            'tel': {element: 'input', type: 'tel', editable: true, textBased: true},
            'textarea': {element: 'textarea', editable: true, textBased: true},
            'time': {element: 'input', type: 'time', editable: true, textBased: true},
            'url': {element: 'input', type: 'url', editable: true, textBased: true},
            'week': {element: 'input', type: 'week', editable: true, textBased: true},
            //  Specialized editables
            'checkbox': {element: 'input', type: 'checkbox', editable: true, textBased: false},
            'color': {element: 'input', type: 'color', editable: true, textBased: false},
            'file': {element: 'input', type: 'file', editable: true, textBased: false},
            'range': {element: 'input', type: 'range', editable: true, textBased: false},
            'select': {element: 'select', type: 'select', editable: true, textBased: false},

            'multiselect': {element: 'input', type: 'multiselect', editable: true, textBased: false},
            //  Pseudo-non-editables (containers)
            'checklist': {element: 'div', editable: false, textBased: false},
            'fieldset': {element: 'fieldset', editable: false, textBased: false},
            'radio': {element: 'div', editable: false, textBased: false},
            //  Non-editables (mostly buttons)
            'button': {element: 'button', type: 'button', editable: false, textBased: false},
            'hidden': {element: 'input', type: 'hidden', editable: false, textBased: false},
            'image': {element: 'input', type: 'image', editable: false, textBased: false},
            'legend': {element: 'legend', editable: false, textBased: false},
            //'reset': {element: 'button', type: 'reset', editable: false, textBased: false},
            //'submit': {element: 'button', type: 'submit', editable: false, textBased: false},

            'navigation': {type:'navigation', editable: false, textBased: false}
        };

        return {
            restrict: 'E', // supports using directive as element only
            link: function ($scope, element, attrs) {
                //  Basic initialization
                var newElement = null,
                    newChild = null,
                    optGroups = {},
                    cbAtt = '',
                    foundOne = false,
                    iterElem = element,
                    model = null;


                $scope.tagTransform = function (newTag) {
                    var item = {
                        id: null,
                        text: newTag,
                        value: newTag,
                        leaf: false,
                        id: null
                    };
                    return item;
                };

                ////// Editor options.
                //$scope.configuration = configuration;

                $rootScope.transformResponse = function (modelName, templateName, xml, isStandartDate) {
                    var newPost = {};
                    var keys = _.keys($scope.formData[modelName]);

                    _.each(keys, function (valBig, keyBig) {
                        var values = [];

                        // Get template object
                        $scope.result = utilityService.getObject($rootScope.template[templateName], "element", valBig);

                        if ($scope.result === null) {
                            $scope.result = utilityService.getObject($rootScope.template[templateName], "name", valBig);
                        }

                        if (angular.isDefined($scope.result) && $scope.result !== null) {
                            if (angular.isDefined($scope.formData[modelName])) {
                            	
                                if ($scope.formData[modelName][valBig] === null || angular.isUndefined($scope.formData[modelName][valBig]) || (angular.isDefined($scope.formData[modelName][valBig].value) && $scope.formData[modelName][valBig].value === null)) {
                                	// NULL VALUE
                                    newPost[valBig] = null;
                                } else if (angular.isDefined($scope.result.repeating) && $scope.result.repeating === 'true') {
                                	
                                	// REPEATING ATTRIBUTES
                                    if (angular.isDefined($scope.result.type)) {
                                        if ($scope.result.type === 'Date') {
                                        	
                                        	// DATE
                                            newPost[valBig] = [];
                                            //newPost[valBig][0] = $scope.formData[modelName][valBig];

                                            if (isStandartDate) {
                                                newPost[valBig][0] = $filter('date')(Date.parse($scope.formData[modelName][valBig]), "dd.MM.yyyy");
                                            }
                                            else {
                                                newPost[valBig][0] = Date.parse($scope.formData[modelName][valBig]);
                                            }


                                            //console.log($scope.formData[modelName][valBig] + '  vs  ' + Date.parse($scope.formData[modelName][valBig]))
                                        } else if ($scope.formData[modelName][valBig] instanceof Array && angular.isDefined($scope.formData[modelName][valBig][0]) && (angular.isDefined($scope.formData[modelName][valBig][0].value || angular.isDefined($scope.formData[modelName][valBig][0].name)))) {
                                             _.each($scope.formData[modelName][valBig], function (val, key) {
                                                //if (val) {
                                                if ($scope.result.type === 'Number' || $scope.result.type === 'Integer') {
                                                	
                                                	// NUMBERS
                                                    if (angular.isDefined(val.value)) {
                                                        values.push(parseInt(val.value));
                                                    }
                                                    else {
                                                        values.push(parseInt(val.name));
                                                    }
                                                } else {
                                                	
                                                	// OTHER (STRING)
                                                    if (angular.isDefined(val.value)) {
                                                        values.push(val.value);
                                                    }
                                                    else {
                                                        values.push(val.name);
                                                    }

                                                }
                                                // }
                                            });
                                            newPost[valBig] = values;
                                        } else {
                                            if (angular.isDefined($scope.formData[modelName][valBig].value)) {
                                                values = [];
                                                if ($scope.result.type === 'Number' || $scope.result.type === 'Integer') {
                                                    values.push(parseInt($scope.formData[modelName][valBig].value));
                                                } else {
                                                    values.push($scope.formData[modelName][valBig].value);
                                                }
                                                newPost[valBig] = values;
                                            }
                                        }
                                    }
                                }
                                else {
                                    if (angular.isDefined($scope.result.type)) {
                                        if ($scope.result.type === 'Date') {
                                            //newPost[valBig] = $scope.formData[modelName][valBig];

                                            if (isStandartDate) {
                                                newPost[valBig] = $filter('date')(Date.parse($scope.formData[modelName][valBig]), "dd.MM.yyyy");
                                            }
                                            else {
                                                newPost[valBig] = Date.parse($scope.formData[modelName][valBig]);
                                            }

                                        } else if (angular.isDefined($scope.formData[modelName][valBig]) && angular.isDefined($scope.formData[modelName][valBig].value)) {
                                            if ($scope.result.type === 'Number' || $scope.result.type === 'Integer') {
                                                newPost[valBig] = parseInt($scope.formData[modelName][valBig].value);
                                            } else {
                                                newPost[valBig] = $scope.formData[modelName][valBig].value;
                                            }
                                        }
                                        else if (angular.isDefined($scope.formData[modelName][valBig])) {
                                            if ($scope.formData[modelName][valBig] instanceof Array) {
                                                var first = $scope.formData[modelName][valBig][0];
                                                if (angular.isDefined(first)) {
                                                    if (angular.isDefined(first.value)) {

                                                        if ($scope.result.type === 'Number' || $scope.result.type === 'Integer') {
                                                            newPost[valBig] = parseInt(first.value);
                                                        }
                                                        else {
                                                            newPost[valBig] = first.value;
                                                        }
                                                    }
                                                    else if (angular.isDefined(first.name)) {
                                                        newPost[valBig] = first.name;
                                                    }
                                                    else {
                                                        newPost[valBig] = first;
                                                    }
                                                }
                                            } else {
                                                if (angular.isDefined($scope.formData[modelName][valBig].value)) {
                                                    newPost[valBig] = $scope.formData[modelName][valBig].value;
                                                } else {
                                                    if ($scope.result.type === 'Number' || $scope.result.type === 'Integer') {
                                                        newPost[valBig] = parseInt($scope.formData[modelName][valBig]);
                                                    }
                                                    else {
                                                        newPost[valBig] = $scope.formData[modelName][valBig];
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        if (_.isArray($scope.formData[modelName][valBig]) ) {
                                            if (angular.isDefined($scope.formData[modelName][valBig][0].value)) {
                                                newPost[valBig] = $scope.formData[modelName][valBig][0].value;
                                            }
                                        } else {
                                            newPost[valBig] = $scope.formData[modelName][valBig];
                                        }
                                    }
                                }
                            }
                        } else if (valBig === 'type') {
                            newPost[valBig] = $scope.formData[modelName][valBig];
                        }
                    });


                    if (angular.isDefined(xml)) {
                        return xml;
                    }

                    return newPost;
                };


                var transformResponseToXmlFind = function (modelName, template, xml, newPost, parentTag) {
                    var firstByName = true;
                    var lastName = "";
                    var lastParent = undefined;

                    angular.forEach(template, function (value, key) {

                        // IF VALUE IS GROUPS
                        if (angular.isDefined(value.controls)) {
                            var nameOfGroup = value.name.split("__");
                            var nameOfElement = nameOfGroup[0].split("/");

                            // IF VALUE HAS NAME
                            if (value.name.indexOf("control_") === -1) {

                                // PARENT OF GROUP
                                if (angular.isUndefined(parentTag) || parentTag.length === 0) {

                                    //var x = (new XMLSerializer()).serializeToString(xml).replace(/\sxmlns[^"]+"[^"]+"/g, "");
                                    //xml = (new DOMParser()).parseFromString(x, "text/xml");

                                    //var parent = ($(($(xml)).xpath("//" + nameOfGroup[0]))).first(); //.parent();

                                    var parent = ($(($(xml)).xpath("//" + nameOfElement[0]))).first().parent();
                                }
                                else {
                                    var parent = parentTag;
                                }

                                // DECIDE IF IS FIRST GROUP IN REPEAT
                                if (nameOfGroup[0] !== lastName) {
                                    firstByName = true;
                                    lastParent = parent;
                                }
                                else {
                                    firstByName = false;
                                }

                                if (angular.isUndefined(parent) || parent.length === 0) {
                                    parent = lastParent;
                                }

                                if (firstByName) {


                                   ($(($(xml)).xpath("//" + nameOfGroup[0]))).remove();
                                    firstByName = false;
                                }


                                var groupElement = angular.element('<' + nameOfElement[nameOfElement.length - 1] + '></' + nameOfElement[nameOfElement.length - 1] + '>');



                                parent.append(groupElement);

                                transformResponseToXmlFind(modelName, value.controls, xml, newPost, groupElement);




                                lastName = nameOfGroup[0];
                            }
                            // IF VALUE HASN'T NAME
                            else {

                                //angular.forEach(value.controls, function (contValue, contKey) {
                                //    if (angular.isUndefined(contValue.name)) {
                                //        contValue.name = contValue.element;
                                //        delete contValue.element;
                                //    }
                                //
                                //
                                //    var spliting2 = contValue.name.split("__");
                                //
                                //    var spliting3 = spliting2[0].split("/");
                                //
                                //    var parent = ($(xml)).find(spliting3[0]).first();
                                //
                                //    if (angular.isDefined(newPost[contValue.name]) && angular.isString(newPost[contValue.name])) {
                                //        newPost[contValue.name] = newPost[contValue.name].replace(/&nbsp;/g, ' ');
                                //    }
                                //
                                //    if ((angular.isNumber(newPost[contValue.name])) && (newPost[contValue.name] > 100000)) {
                                //        newPost[contValue.name] = moment(new Date(newPost[contValue.name])).format('DD.MM.YYYY');
                                //    }
                                //
                                //    parent.html(newPost[contValue.name]);
                                //
                                //
                                //    transformResponseToXmlFind(modelName, contValue.controls, xml, newPost);
                                //});

                                transformResponseToXmlFind(modelName, value.controls, xml, newPost, undefined);
                            }
                        }
                        // IF VALUE IS CONTROL
                        else {
                            //IF VALUE HAS NAME
                            if (angular.isUndefined(value.name)) {
                                value.name = value.element;
                                delete value.element;
                            }


                            var nameOfControl = value.name.split("__");

                            var nameOfElement = nameOfControl[0].split("/");

                            //PARENT OF GROUP
                            if (angular.isUndefined(parentTag) || parentTag.length === 0) {


                                //var x  = (new XMLSerializer()).serializeToString(xml).replace(/\sxmlns[^"]+"[^"]+"/g, "");
                                //xml = (new DOMParser()).parseFromString(x, "text/xml");

                                var parent = ($(($(xml)).xpath("//" + nameOfElement[0]))).first().parent();

                                ($(($(xml)).xpath("//" + nameOfElement[0]))).remove();
                            }
                            else {
                                var parent = parentTag;
                            }

                            if (nameOfElement.length > 0) {
                                var controlElement = angular.element('<' + nameOfElement[nameOfElement.length - 1] + '>' + '</' + nameOfElement[nameOfElement.length - 1] + '>');
                            }

                            if (angular.isDefined(newPost[value.name]) && angular.isString(newPost[value.name])) {
                                newPost[value.name] = newPost[value.name].replace(/&nbsp;/g, ' ');
                            }

                            if ((angular.isNumber(newPost[value.name])) && (newPost[value.name] > 100000)) {
                                newPost[value.name] = moment(new Date(newPost[value.name])).format('DD.MM.YYYY');
                            }
                            controlElement.html(newPost[value.name]);


                            parent.append(controlElement);
                        }


                    });
                }

                $rootScope.transformResponseToXml = function (modelName, templateName, xml) {

                    return $q(function(resolve, reject) {

                        if (angular.isUndefined(xml)) {
                            resolve();
                        }
                        else {
                            var newPost = $rootScope.transformResponse(modelName, templateName);


                            var x = (new XMLSerializer()).serializeToString(xml).replace(/\sxmlns[^"]+"[^"]+"/g, "");

                            xml = (new DOMParser()).parseFromString(x, "text/xml");


                            transformResponseToXmlFind(modelName, $rootScope.template[templateName], xml, newPost, undefined); //root);

                            $compile(xml)($scope);

                            var x = (new XMLSerializer()).serializeToString(xml).replace(/\sxmlns[^"]+"[^"]+"/g, "");

                            xml = (new DOMParser()).parseFromString(x, "text/xml");

                            $scope.xmlContent = xml;
                            resolve($scope.xmlContent);
                        }
                    });
                }

                $scope.getCodetables = function (codetable, name) {

                    if ($scope.isCodeBook) {
                        var nod = 'modifiednodes';
                    }
                    else {
                        var nod = 'nodes';
                    }

                    return CodeTablesResource.list({
                        codetable: codetable,
                        id: 'root',
                        nodes: nod
                    }, function (response) {

                        if (response.data != undefined) {
                            $scope.portals = response.data;
                        }
                        else {
                            $scope.portals = [response];
                        }
                        if (angular.isUndefined($scope.dataOptions)) {
                            $scope.dataOptions = {};
                        }
                        $scope.dataOptions[name] = $scope.portals;

                    }, function (error) {
                        $scope.dataOptions[name] = [];
                    });

                };

                $scope.getOptions = function (options, name) {

                    return $q(function(resolve, reject) {
                        var newOptions = [];

                        angular.forEach(options, function (value, attr) {

                            for (var key in value) {

                                var tempObj = {};
                                tempObj['id'] = key;
                                tempObj['value'] = key;
                                tempObj['text'] = value[key];

                                newOptions.push(tempObj);
                            }
                        });

                        $scope.dataOptions[name] = newOptions;

                        resolve();
                    });


                };

                $scope.preSelectedSingleSelect = function(name, value) {
                    // find pre selected values
                    if (angular.isDefined(model[name])) {

                        if (_.isArray($scope.formData[attrs.modelName][name])) {
                            var backModel = $scope.formData[attrs.modelName][name][0];
                        }
                        else {
                            var backModel = $scope.formData[attrs.modelName][name];
                        }

                        $scope.result = utilityService.getObject($scope.dataOptions[name], 'value', backModel);
                        if ($scope.result !== null) {
                            $scope.formData[attrs.modelName][name] = $scope.result;
                        }

                    }
                    else if (angular.isDefined(value)) {

                        $scope.result = utilityService.getObject($scope.dataOptions[name], 'value', value);
                        if ($scope.result !== null) {
                            $scope.formData[attrs.modelName][name] = $scope.result;
                        }

                    }
                }

                $scope.preSelectedMultiSelect = function(name, values) {

                    //find pre selected values
                        if (angular.isDefined(model[name]) && model[name] !== null && $scope.formData[attrs.modelName][name][0] !== null) {
                            var backModel = $scope.formData[attrs.modelName][name];

                            if (! _.isArray(backModel)) {
                                var backModel = [backModel];
                            }

                            $scope.formData[attrs.modelName][name] = [];

                            angular.forEach(backModel, function(value, key) {

                                $scope.result = utilityService.getObject($scope.dataOptions[name], 'value', value);

                                if ($scope.result !== null) {
                                    $scope.formData[attrs.modelName][name].push($scope.result);
                                }
                            });
                        }
                        else if (angular.isDefined(values)) {
                            $scope.formData[attrs.modelName][name] = [];

                            angular.forEach(values, function(value, key) {

                                $scope.result = utilityService.getObject($scope.dataOptions[name], 'value', value);

                                if ($scope.result !== null) {
                                    $scope.formData[attrs.modelName][name].push($scope.result);
                                }
                            });
                        }
                };



                //$scope.$watch(function() {
                //    return angular.toJson($scope.dynamicForm.$error);
                //}, function(){
                //    $scope.errorMessageCreate();
                //}, true);

                $scope.$watchCollection('dynamicForm.$error.repeaterRequired', function() {
                    $scope.errorMessageCreate();
                });
                $scope.$watchCollection('dynamicForm.$error.required', function() {
                    $scope.errorMessageCreate();
                });
                $scope.$watchCollection('dynamicForm.$error.uiSelectRequired', function() {
                    $scope.errorMessageCreate();
                });
                $scope.$watchCollection('dynamicForm.$error.dateGreaterThan', function() {
                    $scope.errorMessageCreate();
                });
                $scope.$watchCollection('dynamicForm.$error.dateLowerThan', function() {
                    $scope.errorMessageCreate();
                });
                $scope.$watchCollection('dynamicForm.$error.dateBetween', function() {
                    $scope.errorMessageCreate();
                });
                $scope.$watchCollection('dynamicForm.$error.uniqueObjectName', function() {
                    $scope.errorMessageCreate();
                });
                $scope.$watchCollection('dynamicForm.$error.pattern', function() {
                    $scope.errorMessageCreate();
                });
                $scope.$watchCollection('dynamicForm.$error.mustBeMore', function() {
                    $scope.errorMessageCreate();
                });
                $scope.$watchCollection('dynamicForm.$error.uniqueProduct', function() {
                    $scope.errorMessageCreate();
                });


                $scope.$watchCollection('dynamicForm.runValid', function() {
                    $scope.errorMessageCreate();
                })

                $rootScope.errorMessageCreate = function() {

                    if (angular.isUndefined($rootScope.errorMessage)) {
                        $rootScope.errorMessage = {};
                    }

                    var errors = '';
                    if (angular.isDefined($scope.activeTabObject)) {

                        angular.forEach(_.keys($scope.activeTabObject), function (valueForm, keyForm) {

                            errors = '';

                            angular.forEach($scope.activeTabObject[valueForm].dynamicForm.$error, function (value, key) {

                                angular.forEach(value, function (errValue, errKey) {

                                    var result = utilityService.getObject($scope.formTemplate, 'name', errValue.$name);

                                    if (!result) {
                                        result = utilityService.getObject($scope.editorTemplate, 'name', errValue.$name);
                                    }

                                    if (result) {
                                        errors += result.text + $filter('translate')("validation." + key) + ' \n';
                                    }

                                });
                            });


                            $rootScope.errorMessage[valueForm] = errors;
                        });
                    }
                    else if (angular.isDefined($scope.dynamicForm)){


                        angular.forEach($scope.dynamicForm.$error, function (value, key) {

                            angular.forEach(value, function (errValue, errKey) {

                                var result = utilityService.getObject($scope.formTemplate, 'name', errValue.$name);

                                if (!result) {
                                    result = utilityService.getObject($scope.editorTemplate, 'name', errValue.$name);
                                }

                                if (!result) {
                                    result = utilityService.getObject($scope.selected.template, 'name', errValue.$name);
                                }

                                if (result) {
                                    errors += result.text + $filter('translate')("validation." + key) + ' \n';
                                }

                            });
                        });


                        $rootScope.errorMessage = errors;
                    }


                };





                $scope.$watch(attrs.template, function(value) {

                    attrs.template = value;

                    if (angular.isUndefined($rootScope.template)) {
                        $rootScope.template = [];
                    }

                    $rootScope.template[attrs.name] = value;

                });



                $scope.$watch(attrs.ngModel, function(value) {
                    model = value;

                    if (angular.isUndefined($scope.formData)) {
                        $scope.formData = [];
                    }
                    
                    if (angular.isUndefined($scope.formData[attrs.modelName])) {
                        $scope.formData[attrs.modelName] = [];
                    }

                    //  Check that the required attributes are in place
                    if (angular.isDefined(attrs.ngModel) && (angular.isDefined(attrs.template) || angular.isDefined(attrs.templateUrl)) && !element.hasClass('dynamic-form')) {
                        model = $parse(attrs.ngModel)($scope);

                        //  Grab the template. either from the template attribute, or from the URL in templateUrl
                        //(attrs.template ? $q.when($parse(attrs.template)($scope)) :
                        //    $http.get(attrs.templateUrl, {cache: $templateCache}).then(function (result) {
                        //        return result.data;
                        //    })
                            //$rootScope.template = response.form_SC_CS_IA;

                            template = attrs.template;

                            var setProperty = function (obj, props, value, lastProp, buildParent) {
                                    props = props.split('.');
                                    lastProp = lastProp || props.pop();

                                    for (var i = 0; i < props.length; i++) {
                                        obj = obj[props[i]] = obj[props[i]] || {};
                                    }

                                    if (!buildParent) {
                                        obj[lastProp] = value;
                                    }
                                },
                                bracket = function (model, base) {
                                    props = model.split('.');
                                    return (base || props.shift()) + (props.length ? "['" + props.join("']['") + "']" : '');
                                },
                                myBuildFields = function (field, parent) {
                                    if (angular.isDefined(field.element)) {
                                        field.name = field.element;
                                    }

                                    if (angular.isUndefined(field.name)) {
                                        field.name = 'control_' + $scope.unique;
                                    }
                                    field.model = field.name;

                                    if (angular.isUndefined(field.size)) {
                                        field.size = 12;
                                    }
                                    else if (field.size > 12) {
                                        field.size = 12;
                                    }


                                    if (angular.isUndefined(field.text)) {
                                        field.text = "";
                                    }

                                    if (!(angular.isDefined(field.required) && field.required)) {
                                        field.required = false;
                                    }


                                    if (field.disableIsMinor) {
                                        var disableString = true;
                                    }
                                    else {
                                        var disableString = '(formData[\'' + attrs.modelName + '\'][\'form_readonly\'] || ' + field.readonly + ')';
                                    }

                                    var newGroup = "";

                                    //if (String(id).charAt(0) == '$') {
                                    //    // Don't process keys added by Angular...  See GitHub Issue #29
                                    //    return;
                                    //}


                                    // Check controls type
                                    if (!angular.isDefined(controls[field.control_type]) || controls[field.control_type] === false) {

                                        //  Unsupported.  Create SPAN with field.label as contents
                                        newGroup = angular.element('<span></span>');
                                        if (angular.isDefined(field.label)) {angular.element(newElement).html(field.label);}
                                        angular.forEach(field, function (val, attr) {
                                            if (["label", "type"].indexOf(attr) > -1) {return;}
                                            newGroup.attr(attr, val);
                                        });
                                        //return newElement;
                                    }

                                    // ADD GROUP
                                    else if (field.control_type === "group") {

                                        //Collapse in groupe
                                        if (angular.isDefined(field.collapse) && field.collapse) {

                                            //newGroup = angular.element('<accordion-group heading="' + field.text + '" is-open="formData[\'' + attrs.modelName + '\'][\'' + $field.name +'\'].isCollapsed" class="nopadding cs-form col-sm-' + (field.size * 3) + ' col-xs-' + (field.size * 3) + '">' +
                                            //
                                            //    '<div class="space">' +
                                            //    '</div>' +
                                            //'</accordion-group>');

                                            newGroup = angular.element(
                                            '<div heading="' + field.text + '" ' +
                                            '   is-open="formData[\'' + attrs.modelName + '\'][\'' + field.name +'\'].isCollapsed" ' +
                                            '   class="nopadding cs-form col-sm-' + (field.size * 3) + ' ' +
                                            '   col-xs-' + (field.size * 3) + '"' +
                                            //'   ng-repeat="item in formData[\'' + attrs.modelName + '\'][\'' + field.name +'\']" ' +
                                            '>' +


                                                //'<div class="space">' +
                                                //'</div>' +
                                            '</div>');

                                        }
                                        else {

                                            newGroup = angular.element(
                                                '<div id="' + field.name + '" class="group nopadding cs-form col-sm-' + (field.size * 3) + ' col-xs-' + (field.size * 3) + '">' +
                                                    //'<div class="space">' +
                                                    //'</div>' +
                                                    // Hidden button
                                                    //'<i class="hidebtn fa fa-chevron-down" ng-click="formData[\'' + attrs.modelName + '\'][\'' + field.name + '\'] = ! formData[\'' + attrs.modelName + '\'][\'' + field.name + '\']"></i>' +

                                                '</div>');


                                        }

                                        var groupLabel = angular.element('<div class="group-label"></div>');


                                        if (field.text !== undefined && field.text !== "") {
                                            groupLabel.append(field.text);
                                        }

                                        if (angular.isDefined(field.repeating) && field.repeating) {


                                            $scope.formData[attrs.modelName]['repeat_' + field.name] = 3;
                                            //$scope.fie = field;

                                            newGroup.append('&nbsp;&nbsp;<button title="' + $filter('translate')("button.plus_section") + '" class="plusbtn fa fa-plus" ng-click="addGroup(\'' + field.name + '\')" ng-disabled="' + disableString + '"></i>');
                                            newGroup.append('<button title="' + $filter('translate')("button.minus_section") + '" class="plusbtn fa fa-minus" ng-click="removeGroup(\'' + field.name + '\')" ng-disabled="(formData[\'' + attrs.modelName + '\'][\'form_readonly\'] || ' + field.readonly + '|| formData[\'' + attrs.modelName + '\'][\'' + field.name + '_order\'] === \'1/1\')"></i>');

                                            newGroup.append('<button title="' + $filter('translate')("button.up_section") + '" class="plusbtn fa fa-chevron-up" ng-click="upGroup(\'' + field.name + '\')" ng-disabled="(' +
                                            + disableString +
                                            '|| formData[\'' + attrs.modelName + '\'][\'' + field.name + '_order\'][0] === \'1\'' +

                                            ')"></i>');

                                            newGroup.append('<button title="' + $filter('translate')("button.down_section") + '" class="plusbtn fa fa-chevron-down" ng-click="downGroup(\'' + field.name + '\')" ' +
                                            'ng-disabled="( ' + disableString + '' +
                                            '|| formData[\'' + attrs.modelName + '\'][\'' + field.name + '_order\'][0] === formData[\'' + attrs.modelName + '\'][\'' + field.name + '_order\'][2]' +
                                            ')"></i>');



                                           //newGroup.append('<div class="group-label">{{formData[\'' + attrs.modelName + '\'][\'' + field.name + '\'].order}}</div>');


                                            if (angular.isUndefined($scope.formData[attrs.modelName][field.name])) {
                                                //$scope.formData[attrs.modelName][field.name] = {};
                                                $scope.formData[attrs.modelName][field.name + "_order"] = utilityService.getIndex($scope.editorTemplate, 'name', field.name);
                                            }
                                            groupLabel.append(
                                                '<input readonly="true" type="text"' +
                                                'ng-model="formData[\'' + attrs.modelName + '\'][\'' + field.name + '_order\']" />');

                                        }

                                        if ((field.text !== undefined && field.text !== "") || (angular.isDefined(field.repeating) && field.repeating)) {
                                            newGroup.append(groupLabel)
                                        }

                                    }

                                    // Group with hide and show checkbox - checbox is also control
                                    else if (field.control_type === "groupwithcheckbox") {

                                            newGroup = angular.element(

                                                '<div class="group nopadding cs-form col-sm-' + (field.size * 3) + ' col-xs-' + (field.size * 3) + '">' +
                                                //'<div class="space"></div>' +

                                                '<label class="control-label col-sm-2 group-with-checkbox">' + field.text + '</label>' +
                                                //'<label class="control-label col-sm-' + (field.size * 3) + ' col-xs-' + (field.size * 3) + '" for="isnews">' + field.text + '</label>' +

                                                '<div class="col-sm-10 control-content group-with-checkbox">' +
                                                '<div class="checkbox">' +
                                                '<label>' +
                                                '<input type="checkbox" class="form-control checkbox" value="check" ' +
                                                '>' +
                                                '<div class="checkbox_img"></div>' +
                                                //'<span>' + field.text + '</span>' +
                                                '</label>' +
                                                '</div>' +

                                                '</div>' +
                                                '</div>'
                                            );

                                    }
                                    else if (field.control_type === "sub_group") {
                                        newGroup = angular.element('<div class="form-group col-sm-36 col-xs-36">' +
                                        //'<input type="checkbox" class="form-control checkbox" value="check" ng-disabled="formData[\'' + attrs.modelName + '\'][\'form_readonly\']"/>' +
                                        '</div>');
                                    }
                                    else {
                                        if (field.control_type === "singleselect") {

                                            if(angular.isUndefined($scope.dataOptions)) {
                                                $scope.dataOptions = {};
                                            }

                                            $scope.dataOptions[field.name] = [];

                                            if (angular.isDefined(field.codetable)) {
                                                $scope.getCodetables(field.codetable, field.name).$promise.then(function () {

                                                    if (field.type === 'Number' || field.type === 'Integer') {
                                                        $scope.dataOptions[field.name].unshift({
                                                            id: 0,
                                                            value: 0,
                                                            text: ""
                                                        });
                                                    }
                                                    else if (field.type === 'String') {
                                                        $scope.dataOptions[field.name].unshift({
                                                            id: "",
                                                            value: "",
                                                            text: ""
                                                        });
                                                    }
                                                    else {
                                                        $scope.dataOptions[field.name].unshift({
                                                            id: null,
                                                            value: null,
                                                            text: ""
                                                        });
                                                    }

                                                    $scope.preSelectedSingleSelect(field.name, field.value);
                                                });
                                            }
                                            else if (angular.isDefined(field.options)) {
                                                $scope.getOptions(field.options, field.name).then(function() {

                                                    if (field.type === 'Number' || field.type === 'Integer') {
                                                        $scope.dataOptions[field.name].unshift({
                                                            id: 0,
                                                            value: 0,
                                                            text: ""
                                                        });
                                                    }
                                                    else if (field.type === 'String') {
                                                        $scope.dataOptions[field.name].unshift({
                                                            id: "",
                                                            value: "",
                                                            text: ""
                                                        });
                                                    }
                                                    else {
                                                        $scope.dataOptions[field.name].unshift({
                                                            id: null,
                                                            value: null,
                                                            text: ""
                                                        });
                                                    }

                                                    $scope.preSelectedSingleSelect(field.name, field.value);
                                                });
                                            }


                                            newElement = angular.element(
                                                '<ui-select theme="wcm" id=\'' + field.name + '\'>' +
                                                '<ui-select-match>' +
                                                '{{$select.selected.text}}' +
                                                '</ui-select-match>' +
                                                '<ui-select-choices repeat="option in dataOptions[\'' + field.name + '\'] | filter:$select.search | limitTo: 50">' +  //track by option.value | filter: $select.search">' +
                                                '<span ng-bind-html="option.text | highlight: $select.search">' +
                                                '</span>' +
                                                '</ui-select-choices>' +
                                                '</ui-select>');

                                        }
                                        else if (field.control_type === "multiselect") {

                                        	if(angular.isUndefined($scope.dataOptions)) {
                                            	$scope.dataOptions = {};
                                            }
                                        	
                                            $scope.dataOptions[field.name] = [];

                                            if (angular.isDefined(field.codetable)) {
                                                $scope.getCodetables(field.codetable, field.name).$promise.then(function () {

                                                    $scope.preSelectedMultiSelect(field.name, field.values);
                                                });
                                            }
                                            else if (angular.isDefined(field.options)) {
                                                $scope.getOptions(field.options, field.name).then(function() {
                                                    $scope.preSelectedMultiSelect(field.name, field.values);
                                                });
                                            }

                                            newElement = angular.element(
                                                '<ui-select multiple theme="wcm">' +
                                                '<ui-select-match>' +
                                                '<span title="{{$item.text}}">{{$item.text | strLimit: 20}}</span>' +
                                                '</ui-select-match>' +
                                                '<ui-select-choices repeat="option in dataOptions[\'' + field.name + '\'] | filter:$select.search | limitTo: 50">' +
                                                '{{option.text}}' +
                                                '</ui-select-choices>' +
                                                '</ui-select>');


                                            if (field.name === 'portal_code') {
                                                newElement.attr('on-select', 'onSelected(formData[\'' + attrs.modelName + '\'][\'' + field.name + '\'])');
                                                newElement.attr('on-remove', 'onSelected(formData[\'' + attrs.modelName + '\'][\'' + field.name + '\'])');
                                            }
                                        }
                                        else if ((field.control_type === "multiselecttree") || (field.control_type === "singleselecttree")) {

                                            if (! _.isArray($scope.formData[attrs.modelName][field.name])) {
                                                $scope.formData[attrs.modelName][field.name] = [$scope.formData[attrs.modelName][field.name]];
                                            }

                                            if(angular.isUndefined($scope.dataOptions)) {
                                            	$scope.dataOptions = {};
                                            }
                                            $scope.dataOptions[field.name] = [];

                                            var multi = true;

                                            if (field.control_type === "singleselecttree") {
                                                multi = false;
                                            }

                                            if (field.control_type === "singleselecttree") {
                                                var folder = angular.isDefined(field.folder) ? field.folder : false;
                                            }
                                            else if (field.control_type === "multiselecttree") {
                                                var folder = angular.isDefined(field.folder) ? field.folder : true;
                                            }

                                            if (angular.isDefined(field.codetable)) {

                                                if ($scope.isCodeBook) {
                                                    var nod = 'modifiednodes';
                                                }
                                                else {
                                                    var nod = 'nodes';
                                                }

                                                CodeTablesResource.list({
                                                    operation: 'codetables',
                                                    codetable: field.codetable,
                                                    id: 'root',
                                                    nodes: nod
                                                }, function (response) {
                                                    if (response.data != undefined) {
                                                        $scope.treedata = response.data;
                                                    }
                                                    else {
                                                        $scope.treedata = [response];
                                                    }
                                                    $scope.dataOptions[field.name] = $scope.treedata;

                                                    $scope.getFullPath = function (node, path) {


                                                        if (angular.isDefined(node.children)) {

                                                            if (angular.isDefined(path)) {
                                                                node.path = path + "/" + node.text;
                                                            }
                                                            else {
                                                                node.path = node.text;
                                                            }

                                                            angular.forEach(node.children, function (value, key) {

                                                                $scope.getFullPath(value, node.path);
                                                            });

                                                        }
                                                        else {
                                                            if (angular.isDefined(path)) {
                                                                node.path = path + "/" + node.text;
                                                            }
                                                            else {
                                                                node.path = node.text;
                                                            }
                                                        }


                                                    };

                                                    angular.forEach($scope.treedata, function (value, key) {

                                                        $scope.getFullPath(value);
                                                    });


                                                    if (!(angular.isUndefined(model[field.name]) ||
                                                        model[field.name] === [undefined] ||
                                                        model[field.name][0] === undefined ||
                                                        model[field.name] === null ||
                                                        $scope.formData[attrs.modelName][field.name][0] === null)) {

                                                        var backModel = $scope.formData[attrs.modelName][field.name];
                                                        $scope.formData[attrs.modelName][field.name] = [];

                                                        angular.forEach(backModel, function (value, key) {
                                                            $scope.result = utilityService.getObject($scope.dataOptions[field.name], 'value', value);

                                                            if ($scope.result !== null) {
                                                                $scope.formData[attrs.modelName][field.name].push($scope.result);
                                                            }
                                                        });
                                                    }

                                                    else if (angular.isDefined(field.values)) {

                                                        var backModel = $scope.formData[attrs.modelName][field.name];
                                                        $scope.formData[attrs.modelName][field.name] = [];

                                                        angular.forEach(field.values, function (value, key) {
                                                            $scope.result = utilityService.getObject($scope.dataOptions[field.name], 'value', value);

                                                            if ($scope.result !== null) {
                                                                $scope.formData[attrs.modelName][field.name].push($scope.result);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        $scope.formData[attrs.modelName][field.name] = [];
                                                    }


                                                });
                                            }
                                            else {

                                                    $scope.getOptions(field.options, field.name).then(function() {


                                                        $scope.getFullPath = function (node, path) {


                                                            if (angular.isDefined(node.children)) {

                                                                if (angular.isDefined(path)) {
                                                                    node.path = path + "/" + node.text;
                                                                }
                                                                else {
                                                                    node.path = node.text;
                                                                }

                                                                angular.forEach(node.children, function (value, key) {

                                                                    $scope.getFullPath(value, node.path);
                                                                });

                                                            }
                                                            else {
                                                                if (angular.isDefined(path)) {
                                                                    node.path = path + "/" + node.text;
                                                                }
                                                                else {
                                                                    node.path = node.text;
                                                                }
                                                            }


                                                        };

                                                        angular.forEach($scope.dataOptions[field.name], function (value, key) {

                                                            $scope.getFullPath(value);
                                                        });

                                                        if (angular.isDefined(model[field.name]) && model[field.name] !== null && $scope.formData[attrs.modelName][field.name][0] !== null) {

                                                            var backModel = $scope.formData[attrs.modelName][field.name];
                                                            $scope.formData[attrs.modelName][field.name] = [];

                                                            angular.forEach(backModel, function (value, key) {
                                                                $scope.result = utilityService.getObject($scope.dataOptions[field.name], 'value', value);

                                                                if ($scope.result !== null) {
                                                                    $scope.formData[attrs.modelName][field.name].push($scope.result);
                                                                }
                                                            });
                                                        }
                                                        else if (angular.isDefined(field.values)) {

                                                            var backModel = $scope.formData[attrs.modelName][field.name];
                                                            $scope.formData[attrs.modelName][field.name] = [];

                                                            angular.forEach(field.values, function (value, key) {
                                                                $scope.result = utilityService.getObject($scope.dataOptions[field.name], 'value', value);

                                                                if ($scope.result !== null) {
                                                                    $scope.formData[attrs.modelName][field.name].push($scope.result);
                                                                }
                                                            });
                                                        }
                                                    });

                                            }


                                            newElement = angular.element(
                                                '<div class="tree-select-complete">' +


                                                '<div class="tree-select" ng-click=\"! ' + disableString + ' && openTreeModal(formData, dataOptions, \'modalTree\', \'' + field.name + '\', \'' + field.codetable + '\', \'' + multi + '\', \'' + folder + '\', \'' + attrs.modelName + '\', \'' + field.text + '\', \'' + ($scope.isCodeBook ? 'modifiednodes' : 'nodes') + '\'); dynamicForm.$setDirty(); dynamicForm[\'' + field.name +'\'].$setDirty(); \">' +
                                                //'<div class="placeholder">Kliknutím vyberte</div>' +
                                                '   <a class="tree-button" ng-if="! ' + disableString + '">' +
                                                //'{{ $scope.formData[\'' + attrs.modelName + '\'][\'' + field.name + '\']}}' +
                                                '       <div class="icon img16 tree initial"><input ng-show="false"/></div>' +
                                                '   </a>' +

                                                '   <div class=\"clear\"></div>' +
                                                '</div>' +
                                                '<div class=\"tree-select-match\">' +

                                                '   <div class="select-box" ng-repeat="selectNode in formData[\'' + attrs.modelName + '\'][\'' + field.name + '\']">' +

                                                '       <span ng-click="$event.stopPropagation();" title="{{selectNode.path}}">{{selectNode.path| strLimitReverse: 40}}</span> ' +

                                                '       <span class="close ui-select-match-close" ng-if="! ' + disableString + '"' +
                                                '           ng-click="$event.stopPropagation(); remove(selectNode, \'' + field.name + '\', formData, \'' + attrs.modelName + '\'); dynamicForm.$setDirty(); dynamicForm[\'' + field.name +'\'].$setDirty();"></span>' +
                                                '</div>' +
                                                '</div>'
                                                );


                                        }
                                        else if (field.control_type == "singleselectbase") {

                                            if (angular.isUndefined($scope.formData[attrs.modelName][field.name]) || $scope.formData[attrs.modelName][field.name] === "") {
                                                $scope.formData[attrs.modelName][field.name] = [];
                                            }
                                            else {
                                                if (! _.isArray($scope.formData[attrs.modelName][field.name])) {
                                                    $scope.formData[attrs.modelName][field.name] = [{name: $scope.formData[attrs.modelName][field.name]}];
                                                }
                                                else {
                                                    $scope.mapToList($scope.formData[attrs.modelName][field.name], true).then(function(data){
                                                        $scope.formData[attrs.modelName][field.name] = data;
                                                    });
                                                }
                                            }

                                            newElement = angular.element(
                                                '<div class="tree-select single-select-base" id=\'' + field.name + '\'' +
                                                    'ng-click=\"openBaseModal(formData, \'' + field.name + '\', \'' + attrs.modelName + '\', \'' + field.text + '\' , \'' + field.files_api + '\', \'' + field.search_api + '\', \'' + field.rootfolder_api + '\', \'' + field.folder_select + '\', \'' + field.multi_select + '\'); ' +
                                                    'dynamicForm.$setDirty(); dynamicForm[\'' + field.name +'\'].$setDirty(); \">' +
                                                    //'<div ng-if="! formData[\'' + attrs.modelName + '\'][\'' + field.name +'\'].length > 0" class="placeholder">povinná položka</div>' +

                                                    '<a class="tree-button" ng-if="! ' + disableString + '">' +
                                                        '<div class="icon img16 tree initial"></div>' +
                                                    '</a>' +
                                                    '<div class=\"clear\"></div>' +

                                                '</div>'



                                            );
                                        }
                                        else if (field.control_type == "multiselectautocomplete") {

                                        	if(angular.isUndefined($scope.dataOptions)) {
                                            	$scope.dataOptions = {};
                                            }
                                        	
                                            $scope.dataOptions[field.name] = [];

                                            if (angular.isDefined(field.codetable)) {
                                                $scope.getCodetables(field.codetable, field.name).$promise.then(function () {

                                                    $scope.preSelectedMultiSelect(field.name, field.values);
                                                });
                                            }
                                            else if (angular.isDefined(field.options)) {
                                                $scope.getOptions(field.options, field.name).then(function() {
                                                    $scope.preSelectedMultiSelect(field.name, field.values);
                                                });
                                            }
                                            else {
                                                if (angular.isUndefined($scope.formData[attrs.modelName][field.name]) || $scope.formData[attrs.modelName][field.name] === "") {
                                                    $scope.formData[attrs.modelName][field.name] = [];
                                                }
                                                else {
                                                    if (! _.isArray($scope.formData[attrs.modelName][field.name])) {
                                                        $scope.formData[attrs.modelName][field.name] = [{text: $scope.formData[attrs.modelName][field.name], value: $scope.formData[attrs.modelName][field.name]}];
                                                    }
                                                    else {

                                                        $scope.mapToList($scope.formData[attrs.modelName][field.name], true).then(function(data){
                                                            $scope.formData[attrs.modelName][field.name] = data;
                                                        });
                                                    }
                                                }
                                            }

                                            newElement = angular.element(
                                                '<ui-select tagging="tagTransform"  multiple theme="wcm">' +
                                                '<ui-select-match>' +
                                                '<span title="{{$item.text}}">{{$item.text | strLimit: 40}}</span>' +
                                                '</ui-select-match>' +
                                                '<ui-select-choices repeat="option in dataOptions[\'' + field.name + '\'] | filter:$select.search | limitTo: 50">' +
                                                '{{option.text}}' +
                                                '</ui-select-choices>' +
                                                '</ui-select>');

                                        }
                                        else if (field.control_type == "datetimepickup") {

                                            $scope.opened = [];

                                            $scope.openDate = function ($event, name) {

                                                $event.preventDefault();
                                                $event.stopPropagation();

                                                $scope.opened[name] = true;
                                            };


                                            if (angular.isDefined(model[field.name]) && model[field.name] !== null) {

                                                if (_.isArray(model[field.name])) {

                                                    var d = moment(model[field.name][0], ["DD.MM.YYYY", moment.ISO_8601, "ddd MMM D YYYY HH:mm:ss [GMT]ZZ", "x"]);
                                                    $scope.formData[attrs.modelName][field.name] = new Date(d);

                                                }
                                                else {
                                                    var d = moment(model[field.name].toString(), ["DD.MM.YYYY", moment.ISO_8601, "ddd MMM D YYYY HH:mm:ss [GMT]ZZ", "x"]);
                                                    $scope.formData[attrs.modelName][field.name] = new Date(d);

                                                }

                                            }
                                            else if (angular.isDefined(field.values)) {
                                                var d = moment(field.values[0].value, ["DD.MM.YYYY", moment.ISO_8601, "ddd MMM D YYYY HH:mm:ss [GMT]ZZ", "x"]);
                                                $scope.formData[attrs.modelName][field.name] = new Date(d);

                                            }
                                            else if (angular.isDefined(model[field.name]) && model[field.name] === null) {

                                                $scope.formData[attrs.modelName][field.name] = null;
                                            }
                                            else {
                                                $scope.formData[attrs.modelName][field.name] = new Date();
                                            }

                                            newElement = angular.element(
                                                '<input type="text" class="form-control" ' +
                                                '   datepicker-popup="{{format}}" is-open="opened[\'' + field.model + '\']"  ' +
                                                '   datepicker-options="dateOptions" show-button-bar="false" parent="' + parent + '"' +
                                                '/>'

                                        );
                                        }
                                        else if (field.control_type == "datepickup") {

                                            $scope.opened = [];

                                            $scope.openDate = function ($event, name) {

                                                $event.preventDefault();
                                                $event.stopPropagation();

                                                $scope.opened[name] = true;
                                            };

                                            $scope.dateOptions = {
                                                formatYear: 'yy',
                                                startingDay: 1
                                            };

                                            if (angular.isDefined(model[field.name]) && model[field.name] !== null) {

                                                if (_.isArray(model[field.name])) {
                                                    $scope.formData[attrs.modelName][field.name] = new Date(moment(model[field.name][0], ["DD.MM.YYYY", moment.ISO_8601, "x"])); //model[field.name][0];
                                                }
                                                else {
                                                    $scope.formData[attrs.modelName][field.name] = new Date(moment(model[field.name], ["DD.MM.YYYY", moment.ISO_8601, "x"])); //model[field.name];
                                                }

                                            }
                                            else if (angular.isDefined(field.values)) {
                                                $scope.formData[attrs.modelName][field.name] = new Date(moment(field.values[0].value, ["DD.MM.YYYY", moment.ISO_8601, "x"])); //field.values[0].value;
                                            }
                                            else if (angular.isDefined(model[field.name]) && model[field.name] === null) {

                                                $scope.formData[attrs.modelName][field.name] = null;
                                            }
                                            else {
                                                $scope.formData[attrs.modelName][field.name] = new Date();
                                            }

                                            newElement = angular.element(
                                                '<input type="text" class="form-control" ' +
                                                '   datepicker-popup="{{format}}" is-open="opened[\'' + field.model + '\']"  ' +
                                                '   datepicker-options="dateOptions" close-text="Close" ' +
                                                '/>'
                                            );
                                        }
                                        else if (field.control_type === "textinput") {


                                            if (angular.isDefined(model[field.name]) && model[field.name] !== null) {

                                                if (_.isArray(model[field.name])) {
                                                    $scope.formData[attrs.modelName][field.name] = model[field.name][0];
                                                }

                                            }
                                            newElement = angular.element('<input type="text" class="form-control"/>');

                                        }
                                        else if (field.control_type === "textarea") {
                                            newElement = angular.element('<textarea class="form-control" rows="5"></textarea>');
                                        }
                                        else if (field.control_type === "numberinput") {
                                            newElement = angular.element('<input type="number" class="form-control"/>');
                                        }
                                        else if (field.control_type === "checkbox") {

                                            //// Load value
                                            if (angular.isDefined(model[field.name]) && model[field.name] !== null) {

                                                $scope.formData[attrs.modelName][field.name] = Boolean(model[field.name]);
                                            }
                                            else if (angular.isDefined(field.value)) {
                                                $scope.formData[attrs.modelName][field.name] = Boolean(field.value);
                                            }



                                            newElement = angular.element('<input type="checkbox" class="form-control checkbox" value="check" />');
                                        }

                                        else if (field.control_type === "editor") {

                                            $rootScope.configuration[field.type].idDocument = $scope.formData['formData'].documentID;

                                            if (angular.isDefined($scope.formData['formData'].language_code)) {
                                                $rootScope.configuration[field.type].langDocument = $scope.formData['formData'].language_code.id;
                                            }
                                            
                                            newElement = angular.element('<textarea name="' + field.name + '" formName="' + attrs.modelName + '"  data-ck-editor  ' +

                                            'ng-disabled="' + disableString + '" ckeditor="configuration.' + field.type + '"></textarea>');

                                        }

                                        else if (field.control_type === "submit") {

                                            newElement = angular.element('<input type="button" ng-click="submitted=true; ' +
                                            '   formData[\'' + attrs.modelName + '\'][\'validate\']=dynamicForm.$valid; ' +
                                            '   formData[\'' + attrs.modelName + '\'][\'dirty\']=dynamicForm.$dirty; ' +
                                            '   ' + field.name + '(\'' + field.name + '\')" value="{{\'' + field.text_key + '\' | translate }}"/>');

                                            newElement.attr('ng-disabled', "! formData[\'" + attrs.modelName + "\'][\'buttonIsDisabled\']"); //[\'documentID\']");

                                        }
                                        else {
                                            newElement = angular.element('<input />');
                                        }


                                        //if (angular.isDefined(supported[field.control_type].type)) {
                                        //    if (newElement.length === 1) {
                                        //        newElement.attr('type', supported[field.type].type);
                                        //    }
                                        //}
                                        if (angular.isUndefined(supported[field.type])) {
                                            //console.log(field);
                                        }

                                        var parentCheckBoxValue = "";
                                        var parentCheckBoxValidValue = "";
                                        //var AND = " && ";
                                        //var OR = " || "

                                        if (angular.isDefined(parent)) {
                                            parentCheckBoxValue = 'formData[\'' + attrs.modelName + '\'][\'' + parent + '\'] && ';
                                            parentCheckBoxValidValue = parent + ' && ';
                                           // newElement.attr('novalidate', '');
                                        }

                                        //  Editable fields (those that can feed models)
                                        if (angular.isDefined(controls[field.control_type].editable) && controls[field.control_type].editable) {

                                            newElement.attr('name', bracket(field.model));
                                            newElement.attr('formName', attrs.modelName);

                                            newElement.attr('ng-model', bracket(field.model, attrs.ngModel));
                                            // Build parent in case of a nested model
                                            setProperty(model, field.model, {}, null, true);


                                            //newElement.attr('ng-readonly', '(formData[\'' + attrs.modelName + '\'][\'form_readonly\'] || ' + field.readonly + ')');
                                            //newElement.attr('ng-disabled', '(formData[\'' + attrs.modelName + '\'][\'form_readonly\'] || ' + field.readonly + ')');

                                            //if (field.disableIsMinor) {
                                                newElement.attr('ng-readonly', disableString);
                                                newElement.attr('ng-disabled', disableString);

                                            //}
                                            //else {
                                            //    newElement.attr('ng-readonly', '(formData[\'' + attrs.modelName + '\'][\'form_readonly\'] || ' + field.readonly + ')');
                                            //    newElement.attr('ng-disabled', '(formData[\'' + attrs.modelName + '\'][\'form_readonly\'] || ' + field.readonly + ')');
                                            //}


                                            if (field.required) {

                                                if (field.control_type === "singleselect" || field.control_type === "multiselect" || field.control_type === "multiselectautocomplete") {
                                                    newElement.attr('ui-select-required', parentCheckBoxValue + field.required);
                                                }
                                                else if (field.control_type === "multiselecttree" || field.control_type === "singleselecttree" || field.control_type === "singleselectbase" ) {
                                                    newElement.attr('repeater-required', parentCheckBoxValue + field.required);

                                                }
                                                else {
                                                    newElement.attr('ng-required', parentCheckBoxValue + field.required);
                                                }



                                            }

                                            if ((angular.isUndefined($scope.formData[attrs.modelName][field.name]) || $scope.formData[attrs.modelName][field.name] === null) && angular.isDefined(field.value)) {


                                                $scope.formData[attrs.modelName][field.name] = field.value;
                                            }

                                            if (angular.isDefined(field.validators)) {
                                                angular.forEach(field.validators, function (value, key) {

                                                    if (value.type === "minDate") {
                                                       newElement.attr('date-greater-than', parentCheckBoxValidValue + value.value);
                                                    }
                                                    else if (value.type === "maxDate") {
                                                        //newElement.attr('max', value.value);
                                                        newElement.attr('date-lower-than', parentCheckBoxValidValue + value.value);
                                                    }
                                                    else if (value.type === "date") {
                                                        newElement.attr('date-between', parentCheckBoxValidValue + value.condition);
                                                    }


                                                    else if (value.type === "minLength") {
                                                        newElement.attr('ng-minlength' , parentCheckBoxValue + value.value);

                                                    }
                                                    else if (value.type === "maxLength") {
                                                        newElement.attr('ng-maxlength' , parentCheckBoxValue + value.value);
                                                    }

                                                    else if (value.type === "uniqueObjectName") {
                                                        newElement.attr('unique-object-name', parentCheckBoxValue + value.url);
                                                    }

                                                    else if (value.type === "uniqueproduct") {
                                                        newElement.attr('unique-product', value.url);
                                                    }

                                                    else if (value.type === "regexp") {
                                                        newElement.attr("pattern", value.condition);

                                                    }
                                                    else if (value.type === "mask") {
                                                        newElement.attr("ui-mask",  value.condition);
                                                    }
                                                    else if (value.type === "mustBeMore") {
                                                        newElement.attr("must-be-more",  value.value);
                                                    }


                                                    //newElement.attr('value', field.val);
                                                });


                                            }



                                        }
                                        //  Fields based on input type=text
                                        if (angular.isDefined(controls[field.control_type].textBased) && controls[field.control_type].textBased) {

                                            if (angular.isDefined(field.minLength)) {
                                                newElement.attr('ng-minlength', field.minLength);
                                            }
                                            if (angular.isDefined(field.length)) {
                                                newElement.attr('ng-maxlength', field.length);
                                                newElement.attr( 'my-maxlength', field.length);
                                            }
                                            //if (angular.isDefined(field.validate)) {
                                            //    newElement.attr('ng-pattern', field.validate);
                                            //}
                                            if (angular.isDefined(field.text)) {
                                                //newElement.attr('placeholder', ((angular.isDefined(field.required) && field.required) ? 'povinná položka' : ''));
                                            }
                                        }

                                        if (field.control_type === 'Number' || field.control_type === 'Integer') {
                                            if (angular.isDefined(field.minValue)) {
                                                newElement.attr('min', field.minValue);
                                            }
                                            if (angular.isDefined(field.maxValue)) {
                                                newElement.attr('max', field.maxValue);
                                            }
                                            if (angular.isDefined(field.step)) {
                                                newElement.attr('step', field.step);
                                            }
                                        }

                                        //  Special cases
                                        //if (field.type === 'number' || field.type === 'range') {
                                        //    if (angular.isDefined(field.minValue)) {
                                        //        newElement.attr('min', field.minValue);
                                        //    }
                                        //    if (angular.isDefined(field.maxValue)) {
                                        //        newElement.attr('max', field.maxValue);
                                        //    }
                                        //    if (angular.isDefined(field.step)) {
                                        //        newElement.attr('step', field.step);
                                        //    }
                                        //}


                                        else if (['text', 'textarea'].indexOf(field.type) > -1) {
                                            if (angular.isDefined(field.splitBy)) {
                                                newElement.attr('ng-list', field.splitBy);
                                            }
                                        }
                                        else if (field.control_type === 'checkbox') {
                                            if (angular.isDefined(field.isOn)) {
                                                newElement.attr('ng-true-value', field.isOn);
                                            }
                                            if (angular.isDefined(field.isOff)) {
                                                newElement.attr('ng-false-value', field.isOff);
                                            }
                                            if (angular.isDefined(field.slaveTo)) {
                                                newElement.attr('ng-checked', field.slaveTo);
                                            }
                                        }


                                        //  Common attributes; radio already applied these...
                                        if (field.type !== "radio") {
                                            if (angular.isDefined(field['class'])) {
                                                newElement.attr('ng-class', field['class']);
                                            }
                                            //  ...and checklist has already applied these.
                                            if (field.type !== "checklist") {
                                                if (angular.isDefined(field.disabled)) {
                                                    newElement.attr('ng-disabled', field.disabled);
                                                }
                                                if (angular.isDefined(field.callback)) {
                                                    //  Some input types need listeners on click...
                                                    if (["button", "fieldset", "image", "legend", "reset", "submit"].indexOf(field.type) > -1) {
                                                        cbAtt = 'ng-click';
                                                    }
                                                    //  ...the rest on change.
                                                    else {
                                                        cbAtt = 'ng-change';
                                                    }
                                                    newElement.attr(cbAtt, field.callback);
                                                }
                                            }
                                        }




                                        var formGroup = angular.element('<div class="form-group col-sm-36"></div>');

                                        var formLabel = angular.element('<label class="control-label col-sm-2 ' + (field.control_type === 'editor' ? ' ckeControlEditor' : '') + '">' + field.text + '</label>');





                                        if (angular.isDefined(field.length) && (field.control_type === "textinput" || field.control_type === "textarea")) {
                                            formLabel.append(' (' + '{{formData[\'' + attrs.modelName + '\'][\'' + field.name + '\'].Blength() ? formData[\'' + attrs.modelName + '\'][\'' + field.name + '\'].Blength() : 00}}' + '/' + field.length + ')');

                                        }

                                        if (field.required) {
                                            formLabel.append('<span class="required">&nbsp;*</span>');
                                        }

                                        if (angular.isDefined(field.class)) {
                                            formGroup.addClass(field.class);
                                        }


                                        if (field.size === "3") {
                                            var formControl = angular.element('<div class="col-sm-10 col-sm-small control-content' + (field.control_type === 'editor' ? ' ckeControlEditor' : '') + '"></div>');
                                        }
                                        else if (field.size === "6" || field.control_type === "datetimepickup" || field.control_type === "datepickup") {
                                            var formControl = angular.element('<div class="col-sm-10 col-sm-medium control-content' + (field.control_type === 'editor' ? ' ckeControlEditor' : '') + '"></div>');
                                        }
                                        else if (field.size === "9") {
                                            var formControl = angular.element('<div class="col-sm-10 col-sm-mediumlarge control-content' + (field.control_type === 'editor' ? ' ckeControlEditor' : '') + '"></div>');
                                        }
                                        else {
                                            var formControl = angular.element('<div class="col-sm-10 col-sm-large control-content' + (field.control_type === 'editor' ? ' ckeControlEditor' : '') + '"></div>');
                                        }
                                        //var formControl = angular.element('<div class="col-sm-10 control-content"></div>');



                                        if (field.control_type === 'datepickup') {

                                            var inputGroupControl = angular.element('<div class="col-sm-22 col-xs-22"><div class="col-sm-14 col-xs-14 input-group calendar"></div></div>');
                                            var datePickerControl = angular.element(
                                                '<span class="input-group-btn"> ' +
                                                '<button type="button" class="btn btn-default" ng-click="openDate($event, \'' + field.model + '\')">' +

                                                '</button> ' +
                                                '</span>');

                                            formControl.append(inputGroupControl);
                                            inputGroupControl.append(newElement);
                                            inputGroupControl.append(datePickerControl);

                                        }
                                        else if (field.control_type === 'datetimepickup') {

                                            var inputGroupControl = angular.element('<div class="input-group col-sm-36 col-xs-36"></div>');
                                            var inputDatefieldControl = angular.element('<div class="col-sm-20 calendar col-xs-20"></div>v');
                                            var inputTimefieldControl = angular.element('<div class="col-sm-16 timepckr col-xs-16"><div class="timeSeparator">v</div><div class="hourSeparator">hod.</div></div>');

                                            var timePickerControl = angular.element(' <input type="text" ng-disabled="' + disableString + '" class="form-control" dn-timepicker="HH:mm" ng-model="formData[\'' + attrs.modelName + '\'][\'' + field.model +'\']" step="30" />');

                                            var datePickerControl = angular.element(
                                                '<span class="input-group-btn calendar"> ' +
                                                '<button type="button" class="btn btn-default" ng-click="openDate($event, \'' + field.model + '\')"' +
                                                '   ng-disabled="' + disableString + '">' +

                                                '</button> ' +
                                                '</span>');

                                            formControl.append(inputGroupControl);
                                            inputGroupControl.html(inputDatefieldControl);
                                            inputGroupControl.append(inputTimefieldControl);
                                            inputDatefieldControl.html(datePickerControl);
                                            inputDatefieldControl.append(newElement);
                                            inputTimefieldControl.append(timePickerControl);


                                        }
                                        else if (field.control_type === 'singleselectbase') {
                                            var boxElement = '<div>' +
                                                '<div class="select-box" ng-repeat="selectNode in formData[\'' + attrs.modelName + '\'][\'' + field.name + '\']"' +

                                                '<span ng-click="$event.stopPropagation();" title="{{selectNode.name}}">{{selectNode.name| strLimitReverse: 40}}</span> ' +

                                                '<span class="close ui-select-match-close" ng-if="(! ' + disableString + ')" ' +
                                                'ng-click="$event.stopPropagation(); remove(selectNode, \'' + field.name + '\', formData, \'' + attrs.modelName + '\'); dynamicForm.$setDirty(); dynamicForm[\'' + field.name +'\'].$setDirty();"></span>' +
                                                '</div>' +
                                                '</div>';


                                            //newElement.append(boxElement);
                                            formControl.append(newElement);
                                            formControl.append(boxElement);

                                        }

                                        else {
                                            // Add the element to the page
                                            if (field.control_type == "checkbox") {

                                                if (angular.isUndefined(field.option)) {
                                                    field.option = "";
                                                }
                                                //var checkboxSpan = angular.element('<div class="checkbox_img"></div><span>' + field.text + '</span>');
                                                var checkboxSpan = angular.element('<div class="checkbox_img"></div><span></span>');
                                                var checkboxLabel = angular.element('<label></label>');


                                                checkboxLabel.append(newElement);
                                                checkboxLabel.append(checkboxSpan);

                                                var checkboxDiv = angular.element(
                                                    '<div class="checkbox">' +
                                                    '</div>');

                                                checkboxDiv.append(checkboxLabel);

                                                formControl.append(checkboxDiv);
                                            }
                                            else if (field.control_type === 'submit') {
                                                formControl = angular.element('<div class="control-content"></div>');
                                                formControl.append(newElement);
                                            }
                                            else {

                                                formControl.append(newElement);
                                            }

                                        }



                                        if (field.control_type !== 'multiselect'&& field.control_type !== 'multiselectautocomplete'&& field.control_type !== 'singleselect') {
                                            newElement.attr('ng-class', '{invalid: dynamicForm[\'' + field.name + '\'].$invalid === true}');
                                        }
                                        else if (field.control_type !== 'multiselectautocomplete') {
                                            newElement.attr('ng-class', '{open: $select.open}');
                                        }
                                        else{

                                            newElement.attr('ng-class', '{invalid: dynamicForm[\'' + field.name + '\'].$invalid === true, open: $select.open}');

                                        }


                                        formGroup.append(formLabel);
                                        formGroup.append(formControl);

                                        return formGroup;
                                    }


                                    // Set attribut for groups
                                    //console.log(controls);
                                    //console.log(field);
                                    //console.log(controls[field.control_type]);
                                    if (angular.isDefined(field.control_type) && angular.isDefined(controls[field.control_type].groupBased) && controls[field.control_type].groupBased) {


                                        newGroup.find("input").attr('name', bracket(field.model));

                                        newGroup.find("input").attr('ng-model', bracket(field.model, attrs.ngModel));

                                        //if (field.disableIsMinor) {
                                            //newGroup.find("input").attr('ng-readonly', 'true');
                                            newGroup.find("input").attr('ng-disabled', disableString);
                                        //}
                                        //else if (angular.isDefined(field.readonly)) {
                                        //    newGroup.find("input").attr('ng-disabled', field.readonly || 'formData[\'' + attrs.modelName + '\'][\'form_readonly\']');
                                        //}
                                        //else {
                                        //    newGroup.find("input").attr('ng-disabled', 'formData[\'' + attrs.modelName + '\'][\'form_readonly\']');
                                        //}

                                        // Load value
                                        if (angular.isDefined(model[field.name]) && model[field.name] !== null) {

                                            $scope.formData[attrs.modelName][field.name] = String(model[field.name]) === "true";

                                        }
                                        else if (angular.isDefined(field.value)) {
                                            $scope.formData[attrs.modelName][field.name] = String(field.value) === "true";
                                        }
                                        else {
                                            $scope.formData[attrs.modelName][field.name] = false;
                                        }

                                    }

                                    // Default show group
                                    if (angular.isUndefined($scope.formData[attrs.modelName][field.name])) {
                                        $scope.formData[attrs.modelName][field.name] = true;
                                    }



                                    var hideGroup = angular.element('<div ng-show="formData[\'' + attrs.modelName + '\'][\'' + field.name + '\']"></div>');
                                    var showhideGroup = angular.element('<div class="groupdiv" ng-show="formData[\'' + attrs.modelName + '\'][\'' + field.name + '\']"></div>');

                                    angular.forEach(field.controls, function (element) {

                                        if (field.control_type === "groupwithcheckbox") {
                                            hideGroup.append(myBuildFields(element, field.name));
                                        }
                                        else {
                                           // newGroup.append(myBuildFields(element));
                                            showhideGroup.append(myBuildFields(element));
                                        }

                                    }, element);

                                    if (field.control_type === "groupwithcheckbox") {
                                        newGroup.append(hideGroup);

                                    }
                                    else {
                                        newGroup.append(showhideGroup);
                                    }

                                    return newGroup;
                                };


                            $scope.unique = 0;



                            angular.forEach(template, function (element) {

                                this.append(myBuildFields(element));

                                if(element.control_type === "group" || element.control_type === "groupwithcheckbox") {
                                    $scope.unique++;
                                }
                            }, element);


                            //  Determine what tag name to use (ng-form if nested; form if outermost)
                            //while (!angular.equals(iterElem.parent(), $document) && !angular.equals(iterElem[0], $document[0].documentElement)) {
                            //    if (['form', 'ngForm', 'dynamicForm'].indexOf(attrs.$normalize(angular.lowercase(iterElem.parent()[0].nodeName))) > -1) {
                            //        foundOne = true;
                            //        break;
                            //    }
                            //    iterElem = iterElem.parent();
                            //}



                            if (foundOne) {
                                newElement = angular.element($document[0].createElement('ng-form'));
                            }
                           else {
                                newElement = angular.element('<form id="' + attrs.id + '" class="dynamic-form" novalidate name=\"dynamicForm\"></form>');
                            }

                        $timeout(function () {

                            $rootScope.dynamicForm = $scope.dynamicForm;

                        }, 0);


                            var divElement = angular.element('<div class="cs-form-content"></div>');

                            //newElement.append('<div ng-show="(dynamicForm.$invalid && submitted)" class="error-message"><span><i class="fa fa-ban"></i>Zdá se, že jste nevyplnil všechny povinné položky!</span></div>');

                            //  Psuedo-transclusion
                            //angular.forEach(attrs.$attr, function (attName, attIndex) {
                            //    newElement.attr(attName, attrs[attIndex]);
                            //});
                            newElement.attr('model', attrs.ngModel);
                            newElement.removeAttr('ng-model');

                        newElement.attr('form-valid', "submit()");

                            angular.forEach(element[0].classList, function (clsName) {
                                newElement[0].classList.add(clsName);
                            });
                            newElement.addClass('dynamic-form');
                            newElement.addClass('form-horizontal');


                        var accordion = angular.element('<accordion close-others="true"></accordion>');
                        accordion.append(divElement);

                        newElement.append(accordion);
                            //newElement.append(divElement);
                            divElement.append(element.contents());


                            //  onReset logic
                            newElement.data('$_cleanModel', angular.copy(model));
                            newElement.bind('reset', function () {
                                $timeout(function () {
                                    $scope.$broadcast('reset', arguments);
                                }, 0);
                            });
                            $scope.$on('reset', function () {
                                $scope.$apply(function () {
                                    $scope.formData[attrs.ngModel] = {};
                                });
                                $scope.$apply(function () {
                                    $scope.formData[attrs.ngModel] = angular.copy(newElement.data('$_cleanModel'));
                                });
                            });

                            //  Compile and update DOM
                            $compile(newElement)($scope);

                        if ($('dynamic-form#' + attrs.id + '').length === 1) {
                            $('dynamic-form#' + attrs.id + '').replaceWith(newElement);
                        }
                        else {
                            element.replaceWith(newElement);
                        }
                    }
                });
            }
        };
    }])
    //  Not a fan of how Angular's ngList is implemented, so here's a better one (IMO).  It will ONLY
    //  apply to <dynamic-form> child elements, and replaces the ngList that ships with Angular.
    .directive('ngList', [function () {
        return {
            require: '?ngModel',
            link: function (scope, element, attr, ctrl) {
                var match = /\/(.*)\//.exec(element.attr(attr.$attr.ngList)),
                    separator = match && new RegExp(match[1]) || element.attr(attr.$attr.ngList) || ',';

                if (element[0].form !== null && !angular.element(element[0].form).hasClass('dynamic-form')) {
                    return;
                }

                ctrl.$parsers.splice(0, 1);
                ctrl.$formatters.splice(0, 1);

                ctrl.$parsers.push(function(viewValue) {
                    var list = [];

                    if (angular.isString(viewValue)) {
                        //  Don't have Angular's trim() exposed, so let's simulate it:
                        if (String.prototype.trim) {
                            angular.forEach(viewValue.split(separator), function(value) {
                                if (value) list.push(value.trim());
                            });
                        }
                        else {
                            angular.forEach(viewValue.split(separator), function(value) {
                                if (value) list.push(value.replace(/^\s*/, '').replace(/\s*$/, ''));
                            });
                        }
                    }

                    return list;
                });

                ctrl.$formatters.push(function(val) {
                    var joinBy = angular.isString(separator) && separator || ', ';

                    if (angular.isArray(val)) {
                        return val.join(joinBy);
                    }

                    return undefined;
                });
            }
        };
    }])
    //  Following code was adapted from http://odetocode.com/blogs/scott/archive/2013/07/05/a-file-input-directive-for-angularjs.aspx
    .directive('input', ['$parse', function ($parse) {
        return {
            restrict: 'E',
            require: '?ngModel',
            link: function (scope, element, attrs, ctrl) {
                if (ctrl === null) {
                    // Doesn't have an ng-model attribute; nothing to do here.
                    return;
                }

                if (attrs.type === 'file') {
                    var modelGet = $parse(attrs.ngModel),
                        modelSet = modelGet.assign,
                        onChange = $parse(attrs.onChange),
                        updateModel = function () {
                            scope.$apply(function () {
                                modelSet(scope, element[0].files);
                                onChange(scope);
                            });
                        };

                    ctrl.$render = function () {
                        element[0].files = this.$viewValue;
                    };
                    element.bind('change', updateModel);
                }
                else if (attrs.type === 'range') {
                    ctrl.$parsers.push(function (val) {
                        if (val) {
                            return parseFloat(val);
                        }
                    });
                }
            }
        };
    }])
    //  Following code was adapted from http://odetocode.com/blogs/scott/archive/2013/07/03/building-a-filereader-service-for-angularjs-the-service.aspx
    .factory('fileReader', ['$q', function ($q) {
        var onLoad = function(reader, deferred, scope) {
                return function () {
                    scope.$apply(function () {
                        deferred.resolve(reader.result);
                    });
                };
            },
            onError = function (reader, deferred, scope) {
                return function () {
                    scope.$apply(function () {
                        deferred.reject(reader.error);
                    });
                };
            },
            onProgress = function(reader, scope) {
                return function (event) {
                    scope.$broadcast('fileProgress',
                        {
                            total: event.total,
                            loaded: event.loaded,
                            status: reader.readyState
                        });
                };
            },
            getReader = function(deferred, scope) {
                var reader = new FileReader();
                reader.onload = onLoad(reader, deferred, scope);
                reader.onerror = onError(reader, deferred, scope);
                reader.onprogress = onProgress(reader, scope);
                return reader;
            };

        return {
            readAsArrayBuffer: function (file, scope) {
                var deferred = $q.defer(),
                    reader = getReader(deferred, scope);
                reader.readAsArrayBuffer(file);
                return deferred.promise;
            },
            readAsBinaryString: function (file, scope) {
                var deferred = $q.defer(),
                    reader = getReader(deferred, scope);
                reader.readAsBinaryString(file);
                return deferred.promise;
            },
            readAsDataURL: function (file, scope) {
                var deferred = $q.defer(),
                    reader = getReader(deferred, scope);
                reader.readAsDataURL(file);
                return deferred.promise;
            },
            readAsText: function (file, scope) {
                var deferred = $q.defer(),
                    reader = getReader(deferred, scope);
                reader.readAsText(file);
                return deferred.promise;
            }
        };
    }])


    .directive('repeaterRequired', function() {
        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                ctrl.$validators.repeaterRequired = function(modelValue, viewValue) {
                    return angular.isArray(modelValue) && modelValue.length > 0;
                };
            }
        };
    })

    .directive('uiSelectRequired', function() {
        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                ctrl.$validators.uiSelectRequired = function(modelValue, viewValue) {

                    if (angular.isArray(modelValue)) {
                        return (angular.isArray(modelValue) && modelValue.length > 0);
                    }
                    else {
                        return angular.isDefined(viewValue) && angular.isDefined(viewValue.text) && viewValue.value !== null && viewValue.value !== 0 && viewValue.value !== "";
                    }
                };
            }
        };
    })


    .directive('dateLowerThan', ["$filter", function ($filter) {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                var validateDateRange = function (inputValue) {
                    var fromDate = moment(inputValue, 'DD.MM.YYYY');
                    var toDate = moment(attrs.dateLowerThan, 'DD.MM.YYYY');
                    var isValid = isValidDateRange(fromDate, toDate);
                    ctrl.$setValidity('dateLowerThan', isValid);
                    return inputValue;
                };

                ctrl.$parsers.unshift(validateDateRange);
                ctrl.$formatters.push(validateDateRange);
                attrs.$observe('dateLowerThan', function () {
                    validateDateRange(ctrl.$viewValue);
                });
            }
        };
    }])

    .directive('dateGreaterThan', ["$filter", function ($filter) {

        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                var validateDateRange = function (inputValue) {
                    var fromDate = moment(attrs.dateGreaterThan, 'DD.MM.YYYY');
                    var toDate = moment(inputValue, 'DD.MM.YYYY');
                    var isValid = isValidDateRange(fromDate, toDate);
                    ctrl.$setValidity('dateGreaterThan', isValid);
                    return inputValue;
                };

                ctrl.$parsers.unshift(validateDateRange);
                ctrl.$formatters.push(validateDateRange);
                attrs.$observe('dateGreaterThan', function () {
                    validateDateRange(ctrl.$viewValue);

                });
            }
        };
    }])

    .directive('dateBetween', ["$filter", function ($filter) {

        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                var validateDateRange = function (inputValue) {
                    var condition = attrs.dateBetween;

                    if (isCzechDate(inputValue)) {
                        var date = moment(inputValue, 'DD.MM.YYYY');
                    }
                    else {
                        var date = moment(new Date(inputValue));
                    }


                    if (! date.isValid()) {
                        date = moment(inputValue, 'DD.MM.YYYY');
                    }

                    var isValid = isValidDateBetween(condition, date, scope.$parent, attrs.name);

                    ctrl.$setValidity('dateBetween', isValid);
                    return inputValue;
                };

                ctrl.$parsers.unshift(validateDateRange);
                ctrl.$formatters.push(validateDateRange);
                attrs.$observe('dateBetween', function () {
                    validateDateRange(ctrl.$viewValue);

                });
            }
        };
    }])



    .directive('uniqueObjectName', ["$filter", "DocumentsResource", function ($filter, DocumentsResource) {

        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                if (!ctrl) {
                    return;
                }

                var validateUniqueObjectName = function (inputValue) {

                    if (angular.isDefined(scope.$parent.formData)) {
                        var docId = scope.$parent.formData[attrs.formname]['documentID'];
                    }
                    else if (angular.isDefined(scope.$parent.$parent.formData)) {
                        var docId = scope.$parent.$parent.formData[attrs.formname]['documentID'];
                    }
                    else if (angular.isDefined(scope.$parent.$parent.$parent.formData)) {
                        var docId = scope.$parent.$parent.$parent.formData[attrs.formname]['documentID'];
                    }


                    if (inputValue != "") { // && angular.isDefined(docId)) {
                        DocumentsResource.validateUniqueObjectName({
                                url: attrs.uniqueObjectName,
                                name: inputValue,
                                id: docId
                            },
                            function (response) {

                                ctrl.$setValidity('uniqueObjectName', response.result);
                                return inputValue;

                            }, function (error) {
                            	$rootScope.$MessageService.writeException(error);
                            });

                    }
                };


                elm.on('blur', function () {

                    validateUniqueObjectName(ctrl.$viewValue);

                });


            }
        };
    }])


    .directive('uniqueProduct', ["$filter", "DocumentsResource", function ($filter, DocumentsResource) {

        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {


                if (!ctrl) {
                    return;
                }

                ctrl.$validators.uniqueProduct = function(modelValue, viewValue) {


                    if (angular.isDefined(scope.$parent.formData)) {
                        var docId = scope.$parent.formData[attrs.formname]['documentID'];
                    }
                    else if (angular.isDefined(scope.$parent.$parent.formData)) {
                        var docId = scope.$parent.$parent.formData[attrs.formname]['documentID'];
                    }
                    else if (angular.isDefined(scope.$parent.$parent.$parent.formData)) {
                        var docId = scope.$parent.$parent.$parent.formData[attrs.formname]['documentID'];
                    }

                    if (angular.isDefined(modelValue) && modelValue.length > 0 && angular.isDefined(modelValue[0]) && angular.isDefined(modelValue[0].id)) {
                        DocumentsResource.validateUniqueProduct({
                                url: attrs.uniqueProduct,
                                productId: modelValue[0].id,
                                documentId: docId
                            },
                            function (response) {

                                ctrl.$setValidity('uniqueProduct', response.result);
                                return response.result;

                            }, function (error) {
                                $rootScope.$MessageService.writeException(error);
                            });
                    }
                    else {
                        return true;
                    }

                };
            }
        };
    }])


    .directive('mustBeMore', function () {

        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                ctrl.$validators.mustBeMore = function(modelValue, viewValue) {


                    var index = _.findIndex(modelValue, {
                        value: attrs.mustBeMore
                    });

                    return ((index > -1 && modelValue.length > 1) || index === -1 );
                };
            }
        };
    })

    .directive('myMaxlength', ['$compile', '$log', function($compile, $log) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                attrs.$set("ngTrim", "false");
                var maxlength = parseInt(attrs.myMaxlength, 10);
                ctrl.$parsers.push(function (value) {
                    if (value.Blength() > maxlength) {

                        value = value.substr(0, value.length - 1);
                        ctrl.$setViewValue(value);
                        ctrl.$render();
                    }
                    return value;
                });
            }
        };

    }]);


        var isCzechDate = function (str) {
            var d = moment(str,'DD.MM.YYYY');
            if(d == null || !d.isValid()) return false;

            return true; // str.indexOf(d.format('DD.MM.YYYY')) >= 0;
        }

        var isValidDate = function (date) {


            if (date == undefined)
                return false;

            if (! moment.isMoment(date)) {
                date = moment(date, ["DD.MM.YYYY", moment.ISO_8601, "x"]);
            }

            if (date.isValid()) {
                return true;
            }

            return false;
        };

        var getDateDifference = function (fromDate, toDate) {

            return (Date.parse(toDate) - Date.parse(fromDate));
        };

        var isValidDateRange = function (fromDate, toDate) {
            if (fromDate == "" || toDate == "")
                return true;
            if (isValidDate(fromDate) == false) {
                //return false;
                return true;
            }

            if (isValidDate(toDate) == true) {
                var days = getDateDifference(fromDate, toDate);
                if (days < 0) {
                    return false;
                }
            }
            return true;
        };

        var isValidDateBetween = function (condition, selectDate, scope, name) {
            if (condition == "")
                return true;

            var split = condition.split(' && ');

            if (split.length > 1) {
                condition = split[split.length - 1];
            }



            var values = [];
            var sign = "";

            if (condition.indexOf(">=") != -1) {
                values = condition.split(">=");
                sign = ">=";
            }
            else if (condition.indexOf("<=") != -1) {
                values = condition.split("<=");
                sign = "<=";
            }
            else if (condition.indexOf("!=") != -1) {
                values = condition.split("!=");
                sign = "!=";
            }
            else if (condition.indexOf("==") != -1) {
                values = condition.split("==");
                sign = "==";
            }
            else if (condition.indexOf(">") != -1) {
                values = condition.split(">");
                sign = ">";
            }
            else if (condition.indexOf("<") != -1) {
                values = condition.split("<");
                sign = "<";
            }


            var firstDate = "";
            var secondDate = "";


            if (values[0] == name) {
                var date = angular.copy(selectDate);
                firstDate = Date.parse(date);
            }
            else {
                if (isValidDate(values[0])) {
                    var date = angular.copy(moment(values[0]));

                }
                else if (angular.isDefined(scope.dynamicForm['' + values[1]])) {
                    var date = angular.copy(moment(new Date(scope.dynamicForm['' + values[0]].$modelValue)));
                }
                else {
                    return false;
                }

                if (! date.isValid()) {
                    return false;
                }

                firstDate = Date.parse(date);
            }

            if (values[1] == name) {
                var date = angular.copy(selectDate);
                secondDate = Date.parse(date);
            }
            else {
                if (isValidDate(values[1])) {
                    var date = angular.copy(moment(values[1]));

                }
                else if (angular.isDefined(scope.dynamicForm['' + values[1]])) {
                    var date = angular.copy(moment(new Date(scope.dynamicForm['' + values[1]].$modelValue)));
                }
                else {
                    return false;
                }

                if (! date.isValid()) {
                    return false;
                }

                secondDate = Date.parse(date);

            }


            if (sign === ">") {
                if (!(firstDate > secondDate))
                    return false;
            }
            else if (sign === "<") {
                if (!(firstDate < secondDate))
                    return false;
            }
            else if (sign === "<=") {
                if (!(firstDate <= secondDate))
                    return false;
            }
            else if (sign === ">=") {
                if (!(firstDate >= secondDate))
                    return false;
            }
            else if (sign === "==") {
                if (!(firstDate == secondDate))
                    return false;
            }
            else if (sign === "!=") {
                if (!(firstDate != secondDate))
                    return false;
            }




            if (split.length > 1) {

                return true && scope.dynamicForm['' + split[0]];
            }

            return true;
        };

