angular.module('documents', ['ui.router', 'diff-match-patch'])

    .controller( 'TemplateSelectCtrl', ['$scope', '$rootScope', 'TemplateService', '$state', '$filter',
                function($scope, $rootScope, TemplateService, $state, $filter ) {
        $scope.tabSelected = "";
        $scope.portalSelected = "";

        $scope.getTabClass = function (tabNum) {
            if ($scope.tabSelected === tabNum) {
                return "active";
            }
            return "";
        };

        $scope.setActiveTab = function (tabNum, portalName) {

            $scope.portalSelected = portalName;
            $scope.tabSelected = tabNum;

            TemplateService.getTemplates($scope, tabNum).success(function() {
                $scope.getTabClass(tabNum);
                
                if($scope.portals.length == 1 && $scope.templates.length == 1) {
                	$state.go('document', {
                		id: $scope.tabSelected, 
                		portal: $filter('withoutInterpunction')($scope.portals[0].object_name), 
                		templateType: $filter('withoutInterpunction')($scope.templates[0].type), 
                		code: $filter('withoutInterpunction')($scope.templates[0].object_name), 
                		templateId: $scope.templates[0].r_object_id
                	});
                }
            })

        };
        
        $scope.selectTemplate = function(template) {
        	$state.go('document', {
        		id: $scope.tabSelected, 
        		portal: $filter('withoutInterpunction')($scope.portalSelected), 
        		templateType: $filter('withoutInterpunction')(template.type), 
        		code: $filter('withoutInterpunction')(template.object_name), 
        		templateId: template.r_object_id});
        };

        //Initialize
        TemplateService.getPortals($scope).success(function() {

            $scope.tabSelected = $scope.portals[0].r_object_id;
            $scope.setActiveTab($scope.tabSelected, $scope.portals[0].object_name);


        })


    }])

    .controller( 'DocumentCtrl', ['$scope', '$sce', '$rootScope', '$q','$stateParams', '$state', '$modal', '$timeout', '$filter', 'x2js', 'ContentResource', 'DocumentResource', 'DocumentsResource', 'utilityService', '$compile', '$window', '$http', '$location',
        function($scope, $sce, $rootScope, $q, $stateParams, $state, $modal, $timeout, $filter, x2js, ContentResource, DocumentResource, DocumentsResource, utilityService, $compile, $window, $http, $location) {

    	$scope.active = {
    		    metadata: false,
    		    editor: false,
    		    overview: false,
    		    versions: false,
    		    relations: false,
    		    history: false
    		  };
    	
        $scope.formData = [];
        $scope.formData['formData'] = {};
        $scope.formData['editorData'] = {};

        $scope.activeTabObject = [];

        $scope.disableTab = {};
        $scope.disableTab.Metadata = false;
        $scope.disableTab.Editor = false;
        $scope.disableTab.Overview = false;
        $scope.disableTab.Versions = false;
        $scope.disableTab.Relations = false;
        $scope.disableTab.History = false;

        $scope.actualDocument = {};
        $scope.hasCreateNewVersion = false;

        $scope.dynamicForm = {};

        $scope.isFirstSave = true;


        $scope.dataOptions = [];


// DYNAMIC FORM METHODS /////////////////
        $scope.onSelected = function (selected) {


            if (angular.isDefined(selected) && selected.length > 0) {
                $rootScope.backDocument = $scope.formData['formData'];

                //rozsireni o id, operace, ...
                $rootScope.backDocument = _.extend($scope.actualDocument, $rootScope.backDocument);

                $state.go('document', {

                    portal: _.pluck(selected, 'value').join(),
                    templateType: $scope.actualDocument.type ? $scope.actualDocument.type : $stateParams.templateType,
                    code: $scope.actualDocument.template_type ? $scope.actualDocument.template_type : $stateParams.code,
                    documentId: $scope.actualDocument.id, // undefined
                    templateId: $scope.actualDocument.id ? undefined : $stateParams.templateId
                }, {reload: true});
            }
        };


        $scope.$watch('formData.formData.title', function(newValue, oldValue) {

            if (angular.isUndefined(oldValue)) {
                oldValue = "";
            }

            if (angular.isDefined(newValue)) {
                if (angular.isUndefined($scope.formData['formData']['teaser_title']) || $scope.formData['formData']['teaser_title'] === oldValue) {
                    $scope.formData['formData']['teaser_title'] = newValue;
                }
            }

        });

        $scope.$watch('formData.formData.abstract_', function(newValue, oldValue) {

            if (angular.isUndefined(oldValue)) {
                oldValue = "";
            }

            if (angular.isDefined(newValue)) {
                if (angular.isUndefined($scope.formData['formData']['teaser_abstract']) || $scope.formData['formData']['teaser_abstract'] === oldValue) {
                    $scope.formData['formData']['teaser_abstract'] = newValue;
                }
            }

        });


        // valueList = templata editoru
        $scope.synchFeTemplate = function (valueList) {

            // node = polozka templaty editoru
            $scope.faTemplate = function(node) {


                if (node.control_type === "editor") {
                    $scope.textList.push(angular.copy(node));
                }

                //else if (node.control_type == "group") {
                //    if (angular.isDefined(node.repeating) && node.repeating) {
                //        $scope.textList.push(node);
                //    }
                //}

                else if (node.control_type !== "" && node.control_type !== 'group'
                    //"singleselectbase" ||
                    //node.control_type === "singleselect" ||
                    //node.control_type === "textinput" ||
                    //node.control_type === "checkbox"
                ) {

                    //$scope.formData['editorData'][node.name] = node;
                    $scope.textList.push(angular.copy(node));
                }
                else {
                    if (angular.isDefined(node.controls) && node.controls.length > 0) {

                        angular.forEach(node.controls, function (value, key) {

                            $scope.faTemplate(value);
                        });
                    }
                }
            };
            return $q(function(resolve, reject) {
                angular.forEach(valueList, function (value, key) {
                    $scope.faTemplate(value);

                });
                resolve();
            });
        };

        $scope.fillEditorData = function(template) {

            //$scope.formData['editorData'] = {};

            angular.forEach($scope.textList, function (value, key) {



                if (angular.isDefined(value.element)) {
                    value.name = value.element;
                }

                var spliting = value.name.split("__");

                //var exist =

                var exist = $($scope.xmlContent).xpath("//" + spliting[0]);

                if (angular.isDefined(exist) && exist.length > 0) {

                    var obj = {};

                    var result = {};

                    if (spliting.length > 1) {

                        //var x = $($scope.xmlContent).xpath("//" + spliting[0]);
                        var countSpliting = spliting[1].split("_");
                        var pathSpliting = spliting[0].split("/");

                        var res = $scope.xmlContent;
                        for (var i = 0; i < pathSpliting.length; i++) {

                            if (countSpliting[i] === "") {
                                countSpliting[i] = 0;
                            }
                            else {
                                countSpliting[i] = Number(countSpliting[i]);
                            }
                            //var backres = $(res).xpath("//" + pathSpliting[i])[countSpliting[i]];
                            var backres = $(res).xpath("./" + pathSpliting[i])[countSpliting[i]];

                            if (angular.isUndefined(backres)) {
                                backres = $(res).xpath("*/" + pathSpliting[i])[countSpliting[i]];

                                if (angular.isUndefined(backres)) {
                                    backres = $(res).xpath("//" + pathSpliting[i])[countSpliting[i]];
                                }
                            }

                            res = backres;
                        }

                        if (angular.isDefined(res)) {
                            result = res.innerHTML;
                        }
                    }
                    else {

                        var res = $($scope.xmlContent).xpath("//" + spliting[0])[0];

                        if (angular.isDefined(res) && angular.isDefined(res.innerHTML)) {
                            result = res.innerHTML;
                        }
                        else {
                            result = res;
                        }

                    }


                    if (value.control_type === 'editor') {

                        $scope.formData['editorData'][value.name] = angular.copy(result);

                    }
                    else if (value.control_type === 'checkbox') {

                        $scope.formData['editorData'][value.name] = (result === "true");

                    }
                    else if (value.control_type === 'singleselect') {

                        $timeout(function () {

                            if (result !== "") {
                                $scope.result = utilityService.getObject($scope.dataOptions[value.name], 'value', result);

                                if ($scope.result !== null) {
                                    $scope.formData['editorData'][value.name] = $scope.result;
                                }
                            }

                        }, 0);
                    }
                    else if (value.control_type === 'multiselecttree' || value.control_type === 'singleselecttree') {

                        $timeout(function () {
                            if (result === "") {
                                $scope.formData['editorData'][value.name] = [];
                            }
                            else {
                                $scope.formData['editorData'][value.name] = [{
                                    value: result,
                                    title: result,
                                    name: result
                                }];
                            }

                        }, 0);

                    }
                    else if (value.control_type === 'singleselectbase') {

                        // if (spliting.length > 1) {

                        //if (result === "") {
                        //    $scope.formData['editorData'][value.name] = [];
                        //}
                        //else {
                        //    $scope.formData['editorData'][value.name] = [result];
                        //}
                        // }
                        //else {
                        //
                        $timeout(function () {
                            if (angular.isUndefined(result) || result === "") {
                                $scope.formData['editorData'][value.name] = [];
                            }
                            else {
                                $scope.formData['editorData'][value.name] = [{name: result}];
                            }

                        }, 0);
                        //}
                    }
                    else if (value.control_type === 'datetimepickup' || value.control_type === 'datetimepickup') {

                        $timeout(function () {
                            if (result === "") {
                                $scope.formData['editorData'][value.name] = new Date();
                            }
                            else {
                                $scope.formData['editorData'][value.name] = new Date(moment(result, ["DD.MM.YYYY", moment.ISO_8601]));
                            }

                        }, 0);

                    }
                    else if (value.control_type === 'numberinput') {

                        $timeout(function () {
                            if (result === "") {
                                $scope.formData['editorData'][value.name] = [];
                            }
                            else {
                                $scope.formData['editorData'][value.name] = Number(result);
                            }

                        }, 0);

                    }
                    else {

                        $timeout(function () {
                            if (result === "") {
                                $scope.formData['editorData'][value.name] = "";
                            }
                            else {
                                $scope.formData['editorData'][value.name] = result;
                            }

                        }, 0);

                    }
                }
                else {
                    var toRemove = utilityService.getObject(template, 'name', value.name);

                    if (toRemove === null) {
                        toRemove = utilityService.getObject(template, 'element', value.element);
                    }

                    if (toRemove !== null) {

                        var toRemoveParent = utilityService.getObjectParent(template, 'name', value.name);

                        if (toRemoveParent !== null) {

                            var index = toRemoveParent.indexOf(toRemove);

                            if (index > -1) {
                                toRemoveParent.splice(index, 1);
                            }
                        }
                        else {
                            var index = template.indexOf(toRemove);

                            if (index > -1) {
                                template.splice(index, 1);
                            }
                        }
                    }


                }
            });
        };

        $scope.findControls = function () {

            if (angular.isUndefined($scope.formData['editorData'])) {
                $scope.formData['editorData'] = [];
            }

            $scope.textList = [];

            //var promise = $scope.synchFeTemplate($rootScope.template.editor);
            var promise = $scope.synchFeTemplate($scope.editedTemplate);


            return $q(function(resolve, reject) {

                promise.then( function() {

                    resolve();
                });
            });
        }

        $scope.getXML = function() {

            return $q(function(resolve, reject) {

                if (angular.isDefined($scope.formData['formData']['documentID'])) {
                    var docId = $scope.formData['formData']['documentID'];
                }
                else {
                    var docId = $stateParams.documentId;
                }

                var promiseGetXML = DocumentResource.getXML({
                    id: docId}, function(response) {

                        parser = new DOMParser();
                        $scope.xmlContent = parser.parseFromString (response.list, "text/xml");

                }, function (error) {
                	var title = "";
        		 	$rootScope.$MessageService.writeException(error);
                });

                promiseGetXML.$promise.then(function() {

                    resolve($scope.xmlContent);
                });

            });
        }



            var findElement = function (newTemplate, template, xml, number, parent) {
                var j = 0;

                angular.forEach(template, function(value, key) {

                    if (value.repeating) {

                        if (angular.isDefined(parent)) {
                            //var par = $(xml).xpath("*[parent::" + parent + "]");

                            var nameSplit = value.name.split("/");
                             //var par = $(xml).xpath("./substep");
                            var groups = $(xml).xpath("./" + nameSplit[nameSplit.length - 1]);

                        }
                        else {
                            var groups = $(xml).xpath("//" + value.name); //$(xml).find(value.name);
                        }



                        for (var i = 0; i < groups.length; i++) {

                            var temp = angular.copy(template[key]);

                            newTemplate.splice(j, 0,
                                temp
                            );


                            if (angular.isUndefined(value.name)) {
                                value.name = value.element;
                                delete value.element;
                            }

                            if (angular.isUndefined(number)) {
                                var tempNumber = i;
                            }
                            else {
                                var tempNumber = number + "_" + i;
                            }
                            temp.name += '__' + tempNumber;


                            var back = angular.copy(value.controls);
                            newTemplate[j].controls = [];

                            findElement(newTemplate[j].controls, back, groups[i], tempNumber, value.name);

                            j++;
                        }

                    }
                    else {

                        var temp = angular.copy(template[key]);


                        if (angular.isUndefined(temp.name)) {
                            temp.name = temp.element;
                            delete temp.element;
                        }

                        if(angular.isUndefined(temp.name)) {
                            temp.name = "control_a";
                        }

                        if (angular.isUndefined(number)) {
                            var tempNumber = 0;
                        }
                        else {
                            var tempNumber = number + "_" + 0;
                        }

                        temp.name += '__' + tempNumber;
                        newTemplate.splice(j, 0,
                            temp
                        );

                        if (angular.isDefined(value.controls)) {
                            var back = angular.copy(value.controls);
                            newTemplate[j].controls = [];

                            findElement(newTemplate[j].controls, back, xml, tempNumber, temp.name);
                        }

                        j++;
                    }



                });


            }


        $scope.editTemplate = function (template, document, editor, xml) {

            return $q(function(resolve, reject) {

                var newTemplate = [];

                findElement(newTemplate, template, xml)

                $scope.editedTemplate = newTemplate;

                resolve(newTemplate);
            })

        };

        var findElementInit = function(template, number) {
            angular.forEach(template, function (value, key) {

                if (angular.isUndefined(number)) {
                    var tempNumber = 0;
                }
                else {
                    var tempNumber = number + "_" + 0;
                }


                if (angular.isUndefined(value.name)) {
                    value.name = value.element;
                    delete value.element;
                }

                if (value.repeating) {

                    value.name += '__' + tempNumber;
                    value.element = value.name;

                    findElementInit(value.controls,  tempNumber);

                }
                else {
                    if (angular.isDefined(value.name)) {
                        value.name += '__' + tempNumber;
                        value.element = value.name;
                    }
                }
            });
        }

        $scope.editTemplateInit = function (template) {

            return $q(function(resolve, reject) {

                findElementInit(template);

                $scope.editedTemplate = template; //

                resolve(template);
            });
        }

        var replaceAll = function (text, find, replace) {
            var str = text;
            return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
        };

        var editSelect = function(newGroup, spliting, number, editors) {
            angular.forEach(newGroup.controls, function(contValue, contKey) {

                var splitingControlName = contValue.name.split("__");

                contValue.name = splitingControlName[0] + '__' + number + '_' + splitingControlName[1];
                contValue.model = splitingControlName[0] + '__' + number + '_' + splitingControlName[1];

                $scope.formData['editorData'][contValue.name] = angular.copy($scope.formData['editorData'][splitingControlName[0] + '__' + splitingControlName[1]]);
                $scope.formData['editorData'][contValue.name + "_order"] = angular.copy($scope.formData['editorData'][splitingControlName[0] + '__' + splitingControlName[1] + "_order"]);

                if (contValue.control_type === 'editor') {

                    editors.push({editor: contValue.name, origEditor: splitingControlName[0] + '__' + splitingControlName[1]});
                }


                $scope.dataOptions[contValue.name] = $scope.dataOptions['' + splitingControlName[0] + "__" + splitingControlName[1]];

                if (contValue.control_type === 'singleselect') {

                    var y = jQuery(document.getElementById(contValue.name));
                    jQuery(document.getElementById(contValue.name))[0].innerHTML =
                        '<ui-select theme="wcm2" id=\'' + contValue.name + '\'>' +
                        '<ui-select-match>' +
                        '{{$select.selected.text}}' +
                        '</ui-select-match>' +
                        '<ui-select-choices repeat="option in dataOptions[\'' + contValue.name + '\'] | filter:$select.search | limitTo: 50">' +  //track by option.value | filter: $select.search">' +
                        '<span ng-bind-html="option.text | highlight: $select.search">' +
                        '</span>' +
                        '</ui-select-choices>' +
                        '</ui-select>'
                }
                else if (contValue.control_type === 'singleselectbase') {

                    var elem = jQuery(document.getElementById(contValue.name));
                    elem[0].outerHTML =
                        '<div class="tree-select" id=\'' + contValue.name + '\'' +
                        'ng-click=\"openBaseModal(formData, \'' + contValue.name + '\', \'editorData\', \'' + contValue.text + '\' , \'' + contValue.files_api + '\', \'' + contValue.search_api + '\', \'' + contValue.rootfolder_api + '\', \'' + contValue.folder_select + '\', \'' + contValue.multi_select + '\'); ' +
                        'dynamicForm.$setDirty(); dynamicForm[\'' + contValue.name +'\'].$setDirty(); \">' +
                            //'<div ng-if="! formData[\'' + attrs.modelName + '\'][\'' + field.name +'\'].length > 0" class="placeholder">povinná položka</div>' +

                        '<a class="tree-button">' +
                        '<div class="icon img16 tree initial"></div>' +
                        '</a>' +
                        '<div class=\"clear\"></div></div>';

                    elem = jQuery(document.getElementById(contValue.name));
                    elem[0].nextElementSibling.outerHTML =
                        '<div><div class="select-box" ng-repeat="selectNode in formData[\'editorData\'][\'' + contValue.name + '\']"' +

                        '<span ng-click="$event.stopPropagation();" title="{{selectNode.name}}">{{selectNode.name| strLimitReverse: 40}}</span> ' +

                        '<span class="close ui-select-match-close"' +
                        '   ng-click="$event.stopPropagation(); remove(selectNode, \'' + contValue.name + '\', \'editorData\'); dynamicForm.$setDirty(); dynamicForm[\'' + contValue.name +'\'].$setDirty();"></span>' +
                        '</div></div>';


                }

                if (angular.isDefined(contValue.controls)) {
                    var spliting2 = contValue.name.split("__");
                    spliting2[1] = spliting[1];
                    editSelect(contValue, spliting2, number, editors);
                }

            });
        }

        var replaceSelect = function (htmlGroup, result, number) {

            angular.forEach(result, function(value, key) {
                var spliting = value.name.split("__");

                htmlGroup = replaceAll(htmlGroup, '\'' + value.name + '\'', '\'' + spliting[0] + "__" + number + '_' + spliting[1] + '\'');
                htmlGroup = replaceAll(htmlGroup, '\"' + value.name + '\"', '\"' + spliting[0] + "__" + number + '_' + spliting[1] + '\"');

                htmlGroup = replaceAll(htmlGroup, '\'' + value.name + '_order\'', '\'' + spliting[0] + "__" + number + '_' + spliting[1] + '_order\'');
                htmlGroup = replaceAll(htmlGroup, '\"' + value.name + '_order\"', '\"' + spliting[0] + "__" + number + '_' + spliting[1] + '_order\'');

                htmlGroup = replaceAll(htmlGroup, '' + value.name + '.$invalid', '' + spliting[0] + "__" + number + '_' + spliting[1] + '.$invalid');

                if (angular.isDefined(value.controls)) {
                    htmlGroup = replaceSelect(htmlGroup, value.controls, number);
                }
            });

            return htmlGroup;
        }

        $scope.addGroup = function(name) {

            var obj = {};

            var number = (new Date()).getTime();

            var spliting = name.split("__");

            if (angular.isDefined($($scope.xmlContent).xpath("//" + spliting[0])) &&
                angular.isDefined($($scope.xmlContent).xpath("//" + spliting[0])[spliting[1]])) {


            }

            var element = jQuery(document.getElementById(name))[0];//($( '#' + name ));

            $scope.formData['editorData'][spliting[0] + '__' + number] = true;


            var result = utilityService.getObject($scope.editorTemplate, 'name', name);
            var resultParent = utilityService.getObjectParent($scope.editorTemplate, 'name', name);
            //var indexOfResult = _.findIndex($scope.editorTemplate, {'name': name});
            var indexOfResult = _.findIndex(resultParent, {'name': name});

            var newGroup = angular.copy(result);
                newGroup.name = spliting[0] + '__' + number;
                newGroup.model = spliting[0] + '__' + number;



            var htmlGroup = angular.copy(($(element))[0].outerHTML);


            htmlGroup = replaceAll(htmlGroup, '\'' + name + '\'', '\'' + spliting[0] + "__" + number + '\'');
            htmlGroup = replaceAll(htmlGroup, '\"' + name + '\"', '\"' + spliting[0] + "__" + number + '\"');

            htmlGroup = replaceAll(htmlGroup, '\'' + name + '_order\'', '\'' + spliting[0] + "__" + number + '_order\'');
            htmlGroup = replaceAll(htmlGroup, '\"' + name + '_order\"', '\"' + spliting[0] + "__" + number + '_order\"');

            htmlGroup = replaceAll(htmlGroup, '' + name + '.$invalid', '' + spliting[0] + "__" + number + '.$invalid');




            if (angular.isDefined(result.controls)) {
                htmlGroup = replaceSelect(htmlGroup, result.controls, number);
            }
            jQuery(document.getElementById(name)).after(htmlGroup);

            jQuery(document.getElementById(spliting[0] + '__' + number)).find(".cke").html('');

            var editors = [];
            editSelect(newGroup, spliting, number, editors);


            $scope.activeTabObject['Editor'].dynamicForm.$setDirty();
            $compile(jQuery(document.getElementById(spliting[0] + '__' + number)))($scope);

            angular.forEach(editors, function(contValue, contKey) {
                CKEDITOR.instances[contValue.editor + ''].config = angular.copy(CKEDITOR.instances[contValue.origEditor + ''].config);


            });


            //$scope.editorTemplate.splice(indexOfResult + 1, 0, newGroup);
            resultParent.splice(indexOfResult + 1, 0, newGroup);

            $scope.activeTabObject['Editor'].dynamicForm.$setDirty();

            utilityService.getIndexAll($scope.editorTemplate, 'name', $filter('filter')(resultParent, {name: '' + spliting[0]}), $scope.formData['editorData']);

        }

        $scope.removeGroup = function(name) {

            var resultParent = utilityService.getObjectParent($scope.editorTemplate, 'name', name);
            var sameCat = $filter('filter')(resultParent, {name: '' + name.split('__')[0]}).length;

            if (sameCat > 1) {

                var indexOfResult = _.findIndex(resultParent, {'name': name});
                resultParent.splice(indexOfResult, 1);


                var myEl = jQuery(document.getElementById(name));//
                myEl.remove();

                $scope.activeTabObject['Editor'].dynamicForm.$setDirty();

                utilityService.getIndexAll($scope.editorTemplate, 'name', $filter('filter')(resultParent, {name: '' + name.split('__')[0]}), $scope.formData['editorData']);
            }
        }


        var replaceControls = function(origGroup, newGroup) {

            var resultOrigAll = utilityService.getObjectAll(origGroup, 'name', name);
            var resultNewAll = utilityService.getObjectAll(newGroup, 'name', name);

            for(p=0; p < resultOrigAll.length; p++) {

                if (angular.isDefined(resultOrigAll[p].name)) {
                    var back = angular.copy($scope.formData['editorData'][resultOrigAll[p].name]);
                    $scope.formData['editorData'][resultOrigAll[p].name] = angular.copy($scope.formData['editorData'][resultNewAll[p].name]);
                    $scope.formData['editorData'][resultNewAll[p].name] = back;
                }
            }
        }

        $scope.downGroup = function(name) {

            var resultParent = utilityService.getObjectParent($scope.editorTemplate, 'name', name);

            var indexOfResult = _.findIndex(resultParent, {'name': name});

            if (indexOfResult >= 0 && resultParent.length >= indexOfResult + 2) {

                var origGroup = resultParent[indexOfResult];

                var newGroup = resultParent[indexOfResult + 1];

                var newSplitting = newGroup.name.split("__");
                var origSplitting = origGroup.name.split("__");

                if (newSplitting[0] === origSplitting[0]) {

                    replaceControls(origGroup, newGroup);

                    $scope.activeTabObject['Editor'].dynamicForm.$setDirty();
                }

            }
        }

        $scope.upGroup = function(name) {

            var resultParent = utilityService.getObjectParent($scope.editorTemplate, 'name', name);

            var indexOfResult = _.findIndex(resultParent, {'name': name});

            if (indexOfResult > 0) {

                var origGroup = resultParent[indexOfResult];

                var newGroup = resultParent[indexOfResult - 1];

                var newSplitting = newGroup.name.split("__");
                var origSplitting = origGroup.name.split("__");

                if (newSplitting[0] === origSplitting[0]) {

                    replaceControls(origGroup, newGroup);

                    $scope.activeTabObject['Editor'].dynamicForm.$setDirty();
                }

            }
        }


        $rootScope.$DetailService.detail = undefined;
        $rootScope.$DetailService.metadata = undefined;
        $rootScope.$DetailService.src = undefined;
        $rootScope.$DetailService.ruleProtocol = undefined;


        if (angular.isUndefined($stateParams.documentId)) {
            $scope.isNew = true;


            $scope.disableTab.Editor = true;
            $scope.disableTab.Overview = true;
            $scope.disableTab.Versions = true;
            $scope.disableTab.Relations = true;
            $scope.disableTab.History = true;

            var indexHash = $stateParams.code.indexOf("#");
            var indexDot = $stateParams.code.lastIndexOf(".");


            if (indexHash > -1) {
                var res = $stateParams.code.slice(0, indexHash -1);
            }
            else if (indexDot > -1) {
                var res = $stateParams.code.slice(0, indexDot);
            }

            ContentResource.get({
                portal: $stateParams.portal,
                type: $stateParams.templateType,
                code: res

            }, function (responseDocument) {

                var promiseEditTemplateInit = $scope.editTemplateInit(responseDocument.editor);

                promiseEditTemplateInit.then(function (template) {

                    $scope.formTemplate = responseDocument[$filter('filter')(_.allKeys(responseDocument), 'form', false)[0]];
                    $scope.formData['formData'] = [];

                    $scope.editorTemplate = angular.copy(template);
                    $scope.formData['editorData'] = [];

                    $scope.showEditor = responseDocument.showEditor;

                    // Create empty documents
                    if (angular.isUndefined($stateParams.documentId)) {

                        $rootScope.overlayClass = 'loading';

                        //$scope.formData = [];

                        DocumentResource.createDocument({"templateID": $stateParams.templateId}
                            , function (response) {

                                $scope.showView = angular.isDefined(response.showView) ? response.showView : true;

                                $scope.actualDocument = response;

                                $scope.showEditor = response.showEditor;
                                $scope.formData['formData']['documentID'] = response.id;

                                $stateParams = {};
                                $stateParams.documentId = $scope.formData['formData']['documentID'];
                                $location.path('/documents/document').search($stateParams);

                                $scope.formData['formData']['chronicle_id'] = response.chronicle_id;

                                var existName = utilityService.getObject($scope.formTemplate, 'name', 'name');

                                if (existName === null) {
                                    $scope.formData['formData']['name'] = response.name;
                                }
                                $scope.formData['formData']['type'] = response.type;

                                $scope.formData['formData']['buttonIsEnable'] = true;


                                if ($scope.actualDocument.content_type === 'xml') {
                                    var promiseGetXml = $scope.getXML();

                                    promiseGetXml.then(function (respXML) {


                                        $scope.findControls();
                                        $scope.fillEditorData(template);


                                        $scope.disableTab.Editor = false;
                                        $scope.disableTab.Overview = false;
                                        $scope.disableTab.Versions = false;
                                        $scope.disableTab.Relations = false;
                                        $scope.disableTab.History = false;


                                    });
                                }


                            }, function (error) {
                                var title = "";
                                $rootScope.$MessageService.writeException(error);
                            });
                    }
                });



            }, function (error) {
            	var title = "";
    		 	$rootScope.$MessageService.writeException(error);
            });
        }
        else {

            if (angular.isDefined($stateParams.portal)) {

                $scope.isNew = true;

                var responseDocument = $rootScope.backDocument;

                $scope.formData['formData']['chronicle_id'] = responseDocument.chronicle_id;
                $scope.formData['formData']['lock_owner'] = responseDocument.lock_owner;

                $scope.actualDocument = responseDocument;

                $scope.showView = angular.isDefined(responseDocument.showView) ? responseDocument.showView : true;
                $scope.showEditor = responseDocument.showEditor;

                var res = undefined;
                if (angular.isDefined(responseDocument.template_type)) {
                    var indexHash = responseDocument.template_type.lastIndexOf("#");
                    var indexDot = responseDocument.template_type.lastIndexOf(".");
                }


                if (indexHash > -1) {
                    res = responseDocument.template_type.slice(0, indexHash - 1);
                }
                else if (indexDot > -1) {
                    res = responseDocument.template_type.slice(0, indexDot);
                } else {
                    res = responseDocument.template_type;
                }

                if (angular.isUndefined(res) || res == '') {
                    responseDocument.type = 'cms_attachment'
                    res = 'attachment';
                }

                var portal = $stateParams.portal;
                responseDocument.portal_code = $stateParams.portal.split(',');


                ContentResource.get({
                    portal: portal,
                    type: responseDocument.type,
                    code: res
                }, function (response) {

                    if (responseDocument.type != 'cms_attachment' && responseDocument.type != 'cms_picture') {

                        if ($scope.actualDocument.content_type === 'xml') {
                            var promiseGetXml = $scope.getXML();

                            promiseGetXml.then(function (respXML) {
                                //response.editor = $scope.editTemplate(response.editor, responseDocument, $scope.formData['editorData'], $scope.xmlContent);
                                $scope.editedTemplate = [];
                                var promiseEditTemplate = $scope.editTemplate(response.editor, responseDocument, $scope.formData['editorData'], $scope.xmlContent);

                                promiseEditTemplate.then(function (template) {

                                    $scope.formData['editorData'] = [];

                                    if (responseDocument.rr_state === "H") {
                                        $scope.formData['editorData']['form_readonly'] = true;
                                    }

                                    $scope.findControls();
                                    $scope.fillEditorData(template);


                                    //$scope.editorTemplate = angular.copy(response.editor);
                                    $scope.editorTemplate = angular.copy(template);

                                    //if (angular.isUndefined($scope.editorTemplate) || $scope.editorTemplate.length === 0) {
                                    //    $scope.showEditor = false;
                                    //}
                                })

                            });
                        }
                    }


                    //console.log(response);

                    $scope.formTemplate = response[$filter('filter')(_.allKeys(response), 'form', false)[0]];


                    $scope.formData['formData'] = responseDocument;
                    $scope.formData['formData']['documentID'] = $stateParams.documentId;

                    $scope.formData['formData']['buttonIsEnable'] = $.inArray('CURRENT', responseDocument.version_label) > -1;


                    $scope.formData['formData']['form_readonly'] = responseDocument.operations.can_save === false;
                    $scope.formData['editorData']['form_readonly'] = responseDocument.operations.can_edit === false;


                }, function (error) {
                	var title = "";
        		 	$rootScope.$MessageService.writeException(error);
                });




            }
            else {
                DocumentResource.getDocument({documentId: $stateParams.documentId}
                    , function (responseDocument) {


                        $scope.formData['formData']['chronicle_id'] = responseDocument.chronicle_id;
                        $scope.formData['formData']['lock_owner'] = responseDocument.lock_owner;

                        $scope.actualDocument = responseDocument;
                        $scope.showView = angular.isDefined(responseDocument.showView) ? responseDocument.showView : true;

                        $scope.showEditor = responseDocument.showEditor;

                        //if (responseDocument.current_state < 5 &&
                        //    $.inArray('CURRENT', responseDocument.version_label) > -1) {

                            if (angular.isDefined(responseDocument.lock_owner) && responseDocument.lock_owner === "") {

                                if (!angular.isDefined($stateParams.portal)) {
                                    DocumentResource.documentCheckout({documentId: $stateParams.documentId}
                                        , function (res) {

                                            $scope.formData['formData']['lock_owner'] = res.lock_owner;
                                        }, function (error) {
                                        	var title = "";
                                		 	$rootScope.$MessageService.writeException(error);
                                        });
                                }
                            }
                        //}

                        if (responseDocument.portal_code.length > 0) {

                            var res = undefined;
                            if (angular.isDefined(responseDocument.template_type)) {
                                var indexHash = responseDocument.template_type.lastIndexOf("#");
                                var indexDot = responseDocument.template_type.lastIndexOf(".");
                            }


                            if (indexHash > -1) {
                                res = responseDocument.template_type.slice(0, indexHash - 1);
                            }
                            else if (indexDot > -1) {
                                res = responseDocument.template_type.slice(0, indexDot);
                            } else {
                                res = responseDocument.template_type;
                            }

                            if (angular.isUndefined(res) || res == '') {
                            	if(responseDocument.type != 'cms_publication_log') {
                            		responseDocument.type = 'cms_attachment'
                            		res = 'attachment';                            		
                            	} else {
                            		res = 'cms_publication_log';
                            	}
                            }

                            var portal = "";
                            if (angular.isDefined($stateParams.portal)) {
                                portal = $stateParams.portal;

                                responseDocument.portal_code = $stateParams.portal.split(',');
                            }
                            else {
                                portal = responseDocument.portal_code.join();
                            }

                            ContentResource.get({
                                portal: portal,
                                type: responseDocument.type,
                                code: res
                            }, function (response) {


                                if (responseDocument.type != 'cms_attachment' && responseDocument.type != 'cms_picture') {

                                    if ($scope.actualDocument.content_type === 'xml') {
                                        var promiseGetXml = $scope.getXML();

                                        promiseGetXml.then(function (respXML) {
                                            $scope.editedTemplate = [];
                                            var promiseEditTemplate = $scope.editTemplate(response.editor, responseDocument, $scope.formData['editorData'], respXML);

                                            promiseEditTemplate.then(function (template) {

                                                $scope.formData['editorData'] = angular.copy($scope.formData['editorData']);

                                                if (responseDocument.rr_state === "H") {
                                                    $scope.formData['editorData']['form_readonly'] = true;
                                                }

                                                $scope.findControls();
                                                $scope.fillEditorData(template);

                                                $scope.editorTemplate = angular.copy(template);

                                            })

                                        });
                                    }
                                }


                                $scope.formTemplate = response[$filter('filter')(_.allKeys(response), 'form', false)[0]];


                                $scope.formData['formData'] = responseDocument;
                                $scope.formData['formData']['documentID'] = $stateParams.documentId;

                                $scope.formData['formData']['buttonIsEnable'] = $.inArray('CURRENT', responseDocument.version_label) > -1;


                                $scope.formData['formData']['form_readonly'] = responseDocument.operations.can_save === false;
                                $scope.formData['editorData']['form_readonly'] = responseDocument.operations.can_edit === false;

                            }, function (error) {
                            	var title = "";
                    		 	$rootScope.$MessageService.writeException(error);
                            });


                        }
                        else {
                            $scope.goBackFromNewDocument();
                        }


                    }, function (error) {
                    	var title = "";
            		 	$rootScope.$MessageService.writeException(error);
                    });

            }
        }
        
        // HISTORY
        $scope.loadHistory = function() {

            if ($scope.formData['formData']['form_readonly']) {

            }
            else if(!$scope.isTabValid('Metadata') || !$scope.isTabValid('Editor')) {
        		return;
        	}
        	
        	$scope.docHistory = [];
        	DocumentResource.history({
                name: $scope.formData['formData'].name
            }, function (response) {
            	if(response.data) {
                	for(var index = 0; index < response.data.length; index++) {
                		$scope.docHistory.push(response.data[index]);    		
                	}
                }
            }, function (error) {
            	$rootScope.$MessageService.writeException(error);
            });
        }
        
        // RELATIONS
        
        $rootScope.loadRelations = function() {

            //if ($scope.formData['formData']['form_readonly']) {
            //
            //}
            //else if(!$scope.isTabValid('Metadata') || !$scope.isTabValid('Editor')) {
        	//	return;
        	//}
        	
        	$scope.contains = [];
        	$scope.contained = [];
        	$scope.attachments = [];
        	
        	var docId = undefined;
        	if(angular.isUndefined($scope.formData['formData']) || angular.isUndefined($scope.formData['formData'].documentID)) {
        		docId = $stateParams.documentId;
        	} else {
        		docId = $scope.formData['formData'].documentID;
        	}
        	
        	if(angular.isDefined($scope.formData['formData'].rule_id)) {
        		DocumentResource.ruleAttachments({
        			ruleId: $scope.formData['formData'].rule_id,
                    languageCode: $scope.formData['formData'].language_code.id,
                    ruleVersion: $scope.formData['formData'].rule_version
        		}, function (response) {
        			if(response.data) {
        				for(var index = 0; index < response.data.length; index++) {
        					$scope.attachments.push(response.data[index]);    		
        				}
        			} else if(response.id) {
        				$scope.attachments.push(response);
        			}
        		}, function (error) {
        			$rootScope.$MessageService.writeException(error);
        		});        		
        	}
        	
        	DocumentResource.contains({
        		documentId: docId
            }, function (response) {
                if(response.data) {
                	for(var index = 0; index < response.data.length; index++) {
                		$scope.contains.push(response.data[index]);    		
                	}
                } else if(response.id) {
                	$scope.contains.push(response);
                }
            }, function (error) {
            	$rootScope.$MessageService.writeException(error);
            });
        	
        	DocumentResource.contained({
        		documentId: docId
            }, function (response) {
            	if(response.data) {
                	for(var index = 0; index < response.data.length; index++) {
                		$scope.contained.push(response.data[index]);    		
                	}
                } else if(response.id) {
                	$scope.contained.push(response);
                }
            }, function (error) {
            	$rootScope.$MessageService.writeException(error);
            });
        };
        
        // OVERVIEW
        
        $scope.loadOverview = function() {

            if ($scope.formData['formData']['form_readonly']) {

            }
        	else if (!$scope.isTabValid('Metadata') || !$scope.isTabValid('Editor')) {
        		return;
        	}
        	
        	if(angular.isUndefined($scope.formData['formData'].portal_code)) {
        		return;
        	}

            if ($scope.actualDocument.content_type === 'xml') {
                $rootScope.transformResponseToXml('editorData', 'editor', $scope.xmlContent).then(function (response) {

                    xml = response;
                    //$scope.overviewfile = new File([(new XMLSerializer()).serializeToString(xml)], $scope.formData['formData'].name, {type: "text/xml"});
                    $scope.overviewfile = new Blob([(new XMLSerializer()).serializeToString(xml)], {type: "text/xml"});

                    $scope.selectedPortal = $scope.formData['formData'].portal_code[0];

                    $scope.loadXmlPreview();
                });
            }
            else {

                $scope.selectedPortal = $scope.formData['formData'].portal_code[0];
                $scope.loadXmlPreview();
            }
        };
        
        $scope.reloadPreview = function(item) {
        	$scope.selectedPortal = item;
            $scope.loadXmlPreview();
        }
        
        //$scope.$watch('selectedPortal', function() {
        $scope.loadXmlPreview = function() {
            if (angular.isUndefined($scope.selectedPortal)) {
                return;
            }


            DocumentResource.previewXml({
                    documentId: $scope.formData['formData'].documentID,
                    portal: $scope.selectedPortal.id
                }, {content: $scope.overviewfile}
                , function (response) {

                    if ($scope.actualDocument.content_type === 'xml') {
                        $scope.documentOverview = $sce.trustAsResourceUrl('data:text/html;charset=utf-8,' + encodeURIComponent(response.list));

                        var iframe = document.getElementById("overviewIframe");
                        var iWindow = iframe.contentWindow;
                        var doc = iframe.contentDocument || iframe.contentWindow.document;
                        var height = iWindow.document.body.scrollHeight;
                        $("#overviewIframe").css('height', height + 5 + 'px');

                        iframe.setAttribute("src", $scope.documentOverview);
                    }
                    else {

                        $scope.documentOverview = $sce.trustAsResourceUrl($rootScope.wcmConfig.backend + 'documents/' + $scope.formData['formData'].documentID + '/preview/' + $scope.selectedPortal.id);

                        var iframe = document.getElementById("overviewIframe");
                        var iWindow = iframe.contentWindow;
                        var doc = iframe.contentDocument || iframe.contentWindow.document;
                        var height = iWindow.document.body.scrollHeight;
                        $("#overviewIframe").css('height', height + 5 + 'px');

                        iframe.setAttribute("src", $scope.documentOverview);
                    }
                }, function (error) {
                    $scope.documentOverview = error;
                    $rootScope.$MessageService.writeException(error);
                });
            //});
        }
                
        // VERSIONS

        $scope.loadVersionsNoValid = function() {

            return $q(function(resolve, reject) {
                var docId = undefined;
                if (angular.isUndefined($scope.formData['formData']) || angular.isUndefined($scope.formData['formData'].documentID)) {
                    docId = $stateParams.documentId;
                } else {
                    docId = $scope.formData['formData'].documentID;
                }

                $scope.versionId = undefined;
                DocumentResource.getDocumentVersions({documentId: docId},
                    function (response) {
                        if (response.data) {
                            $scope.versions = response.data;
                        } else {
                            $scope.versions = [response];
                        }

                        resolve();
                    }, function (error) {
                        $rootScope.$MessageService.writeException(error);
                    });
            });
        };
        $scope.loadVersions = function() {

            if ($scope.formData['formData']['form_readonly']) {

            }
            else if(!$scope.isTabValid('Metadata') || !$scope.isTabValid('Editor')) {
        		return;
        	}

            $scope.loadVersionsNoValid();
        };
        
        $scope.loadVersion = function(id) {
        	if($scope.showEditor == true) {
        		DocumentResource.exportDocument({id: id}, 
        				function (response) {
        			$scope.versionId = id;
        			$scope.versionOverview = $sce.trustAsResourceUrl('data:text/html;charset=utf-8,'+ encodeURIComponent(response.list));
        			$timeout(function() {
        				var iframe = document.getElementById("versionIframe");
        				var iWindow = iframe.contentWindow;
        				var doc = iframe.contentDocument || iframe.contentWindow.document;
        				var height = iWindow.document.body.scrollHeight;
        				$("#versionIframe").css('height', height + 20 + 'px');
        			}, 1000);
        		}, function (error) {
        			$rootScope.$MessageService.writeException(error);
        		});
        	} else {
        		$scope.versionId = id;
        	}
        };

        $scope.showDiff = function(oldVersion) {

            if (angular.isUndefined(oldVersion)) {
                var promise = $scope.loadVersionsNoValid();
            }
            else {
                var promise = $q(function(resolve, reject) {
                    setTimeout(function () {
                      resolve();
                    }, 0);
                });
            }


            promise.then(function() {

                if (angular.isUndefined(oldVersion)) {

                    if (angular.isDefined($scope.versions[1])) {
                        oldVersion = $scope.versions[1];
                    }
                }

                if (angular.isDefined(oldVersion)) {

                    var promiseGetXML = DocumentResource.getXMLPreview({
                        id: oldVersion.id,
                        template: 'CS_IE'
                    }, function (response) {

                        $scope.left = response.list;


                        $rootScope.transformResponseToXml('editorData', 'editor', $scope.xmlContent).then(function(response) {


                            $scope.selectedPortal = $scope.formData['formData'].portal_code[0];
                            $scope.overviewfile = new Blob([(new XMLSerializer()).serializeToString(response)], {type: "text/xml"});
                            DocumentResource.previewXml({
                                    documentId: $scope.formData['formData'].documentID,
                                    portal: $scope.selectedPortal.id
                                }, {content: $scope.overviewfile}
                                , function (response2) {


                                    $scope.right = response2.list; //(new XMLSerializer()).serializeToString(response);

                                    var modalInstance = $modal.open({
                                        animation: false,
                                        templateUrl: 'documents/diffModal.tpl.html',
                                        controller: 'DiffModalCtrl',
                                        size: 'lg',
                                        resolve: {
                                            title: function () {
                                                return $filter('translate')("modal.document.message.diff.title");
                                            },
                                            text: function () {
                                                return "";
                                            },
                                            left: function () {
                                                return $scope.left;
                                            },
                                            right: function () {
                                                return $scope.right;
                                            }
                                        }
                                    });

                                    modalInstance.result.then(function (value) {
                                        if (value) {
                                        }
                                    });
                            });


                        });

                    }, function (error) {
                        var title = "";
                        $rootScope.$MessageService.writeException(error);
                    });
                }
            });



        }
        //

        $scope.setTab = function (tab) {

            if (angular.isUndefined($scope.disableTab[tab]) || $scope.disableTab[tab] == false) {

                $timeout(function() {
                    if (tab !== "Metadata" && ($scope.formData['formData']['form_readonly'] !== true)) {
                        angular.element('#btnValid').trigger('click')
                    }
                }, 0, false);


                var loadAll = false;

                if (angular.isDefined($scope.activeTabObject['Metadata'])) {

                    if($scope.formData['formData'] && $scope.formData['formData']['form_readonly'] === true) {
                        $scope.active = {
                            metadata: (tab == 'Metadata'),
                            editor: (tab == 'Editor'),
                            overview: (tab == 'Overview'),
                            versions: (tab == 'Versions'),
                            relations: (tab == 'Relations'),
                        	history: (tab == 'History')
                        };
                    }
                    else {
                        $scope.active = {
                            metadata: ((tab == 'Metadata') || (!$scope.isTabValid('Metadata'))),
                            editor: ((tab == 'Editor') && ($scope.isTabValid('Metadata'))),
                            overview: ((tab == 'Overview') && ($scope.isTabValid('Metadata'))),
                            versions: ((tab == 'Versions') && ($scope.isTabValid('Metadata'))),
                            relations: ((tab == 'Relations') && ($scope.isTabValid('Metadata'))),
                            history: ((tab == 'History') && ($scope.isTabValid('Metadata')))
                        };
                    }
                }
                else {
                    $scope.active = {
                        metadata: (tab == 'Metadata'),
                        editor: (tab == 'Editor'),
                        overview: (tab == 'Overview'),
                        versions: (tab == 'Versions'),
                        relations: (tab == 'Relations'),
                        history: (tab == 'History')
                    };

                    loadAll = true;
                }

                if (angular.isDefined($scope.activeTabObject['Metadata']) || loadAll == true) {
                    if (tab == 'Versions') {
                        $scope.loadVersions();
                    }
                    else if (tab == "Overview") {
                        $scope.loadOverview();
                    }
                    else if ((tab == "Relations")) {
                        $scope.loadRelations();
                    }
                    else if ((tab == "History")) {
                        $scope.loadHistory();
                    }
                }

                $window.scrollTo(0,0);
            }


        };
        
        //$scope.isActiveTab = function (tab) {
        //	return $scope.activeTab == tab;
        //};

        if(angular.isDefined($stateParams.tab)) {
        	$scope.setTab($stateParams.tab);
        } else {
        	$scope.setTab('Metadata');
        }
        

        // Called when the editor is completely ready.
        $scope.onReady = function () {


        };

        $scope.getContent = function () {

            var promise = $rootScope.transformResponseToXml('editorData', 'editor', $scope.xmlContent);


            promise.then(function(response) {
                return response;
            })


        }

        $scope.cancelCheckout = function(newId) {
            return DocumentResource.documentCancelCheckout({documentId: newId}, 
            	function (response) {
            		$rootScope.$ListService.refreshListItem(response, true);
                }, function (error) {
        		 	$rootScope.$MessageService.writeException(error);
                });
        }
        
        $scope.saveAll = function(actiontype, newPost, xmlResult, listScope) {
        		$rootScope.$ListService.refreshListItem( $scope.actualDocument, true);


                $scope.formData['formData']['buttonIsEnable'] = false;

                DocumentResource.putDocument({documentId: $scope.formData['formData']['documentID']}, newPost
                    , function (response) {

                        $scope.formData['formData']['documentID'] = response.id;

                        $stateParams.documentId = $scope.formData['formData']['documentID'];

                        if (actiontype !== 'powerpromote' && $state.current.name == 'document') {
                            $location.path('/documents/document').search($stateParams);
                        }

                        $scope.actualDocument = response;

                        $rootScope.$ListService.refreshListItem(response, true);

                        if ($scope.isNew) {
                		 	$rootScope.$MessageService.writeSuccess($filter('translate')("message.document.create.title"), $filter('translate')("message.document.create.success"), undefined, undefined);
                        }
                        else {
                		 	$rootScope.$MessageService.writeSuccess($filter('translate')("message.document.save.title"), $filter('translate')("message.document.save.success"), undefined, undefined);
                        }

                        if ($scope.isNew || !$scope.isFirstSave) {

                            if (angular.isDefined(xmlResult)) {

                                $rootScope.overlayClass = 'saving';

                                DocumentResource.putDocumentXml({documentId: $scope.formData['formData']['documentID']}, {content: $scope.file}
                                    , function (responseDoc) {

                                        $scope.formData['formData']['documentID'] = responseDoc.id;

                                        $stateParams.documentId = $scope.formData['formData']['documentID'];

                                        if (actiontype !== 'powerpromote' && $state.current.name == 'document') {
                                            $location.path('/documents/document').search($stateParams);
                                        }

                                        $scope.actualDocument = responseDoc;


                                        if ($scope.isNew) {
                                		 	$rootScope.$MessageService.writeSuccess($filter('translate')("message.document.create_content.title"), $filter('translate')("message.document.create_content.success"), undefined, undefined);
                                        }
                                        else {
                                		 	$rootScope.$MessageService.writeSuccess($filter('translate')("message.document.save_content.title"), $filter('translate')("message.document.save_content.success"), undefined, undefined);
                                        }


                                        $scope.isNew = false;


                                        //if (responseDoc.lock_owner === "") {
                                            DocumentResource.documentCheckout({documentId: $scope.formData['formData']['documentID']}
                                                , function (res) {
                                                    $scope.formData['formData']['lock_owner'] = res.lock_owner;


                                                    if (actiontype === 'powerpromote') {
                                                        $scope.cancelCheckout(res.id).$promise.then(function() {
                                                            $scope.powerPromote(res.id, listScope).$promise.then(function(doc) {
                                                                $rootScope.$ListService.refreshListItem(doc, false);

                                                                $scope.formData['formData']['documentID'] = doc.id;
                                                                $stateParams.documentId = $scope.formData['formData']['documentID'];

                                                                if (actiontype !== 'powerpromote' && $state.current.name == 'document') {
                                                                    $location.path('/documents/document').search($stateParams);
                                                                }

                                                                $scope.actualDocument = doc;
                                                            });
                                                        });
                                                    }
                                                    else if (actiontype === 'publish') {

                                                    }
                                                    else {
                                                        $rootScope.$ListService.refreshListItem(res, false);
                                                        $scope.formData['formData']['buttonIsEnable'] = true;
                                                    }

                                                });



                                        //}

                                    }, function (error) {
                            		 	$rootScope.$MessageService.writeException(error);
                                        $scope.formData['formData']['buttonIsEnable'] = true;
                                        $rootScope.$ListService.refreshListItem( response, false);
                                    });
                            }
                            else {
                                $rootScope.$ListService.refreshListItem(response, false);
                            }
                        }
                        else {
                            if (angular.isDefined(xmlResult)) {

                                $rootScope.overlayClass = 'saving';

                                DocumentResource.postDocumentXml({documentId: response.id}, {content: $scope.file}
                                    , function (responseDoc) {

                                        $scope.isFirstSave = false;

                                        $scope.formData['formData']['documentID'] = responseDoc.id;

                                        $stateParams.documentId = $scope.formData['formData']['documentID'];
                                        if (actiontype !== 'powerpromote' && $state.current.name == 'document') {
                                            $location.path('/documents/document').search($stateParams);
                                        }

                                        $scope.actualDocument = responseDoc;

                                        DocumentResource.documentCheckout({documentId: $scope.formData['formData']['documentID']}
                                            , function (res) {

                                                $scope.formData['formData']['documentID'] = res.id;

                                                $stateParams.documentId = $scope.formData['formData']['documentID'];
                                                if (actiontype !== 'powerpromote' && $state.current.name == 'document') {
                                                    $location.path('/documents/document').search($stateParams);
                                                }

                                                $scope.formData['formData']['lock_owner'] = res.lock_owner;

                                                $scope.actualDocument = res;

                                                if ($scope.isNew) {
                                        		 	$rootScope.$MessageService.writeSuccess($filter('translate')("message.document.create_content.title"), $filter('translate')("message.document.create_content.success"), undefined, undefined);
                                                } else {
                                        		 	$rootScope.$MessageService.writeSuccess($filter('translate')("message.document.save_content.title"), $filter('translate')("message.document.save_content.success"), undefined, undefined);
                                                }

                                                $rootScope.$ListService.refreshListItem(res, true);

                                                if (actiontype === 'powerpromote') {
                                                    $scope.cancelCheckout(res.id).$promise.then(function() {
                                                        $scope.powerPromote(res.id, listScope).$promise.then(function(doc) {
                                                            $rootScope.$ListService.refreshListItem(doc, false);

                                                            $scope.formData['formData']['documentID'] = doc.id;
                                                            $stateParams.documentId = $scope.formData['formData']['documentID'];
                                                            if (actiontype !== 'powerpromote' && $state.current.name == 'document') {
                                                                $location.path('/documents/document').search($stateParams);
                                                            }

                                                            $scope.actualDocument = doc;
                                                        });
                                                    });
                                                }
                                                else if (actiontype === 'publish') {

                                                }
                                                else {
                                                	$rootScope.$ListService.refreshListItem(res, false);
                                                    $scope.formData['formData']['buttonIsEnable'] = true;
                                                }

                                            }, function (error) {
                                    		 	$rootScope.$MessageService.writeException(error);
                                                $scope.formData['formData']['buttonIsEnable'] = true;
                                                $rootScope.$ListService.refreshListItem( res, false);
                                            });

                                    }, function (error) {
                            		 	$rootScope.$MessageService.writeException(error);
                                        $scope.formData['formData']['buttonIsEnable'] = true;
                                        $rootScope.$ListService.refreshListItem( response, false);
                                    });
                            }
                            else {
                                $rootScope.$ListService.refreshListItem(response, false);
                            }
                        }

                    }, function (error) {
            		 	$rootScope.$MessageService.writeException(error);
                        $scope.formData['formData']['buttonIsEnable'] = true;
                        $rootScope.$ListService.refreshListItem($scope.actualDocument, false);
                    });

                if (actiontype === 'powerpromote') {
                    $timeout(function () {
                        $scope.goBackFromNewDocument();
                    }, 0);
                }
            };

        $scope.saveMetadata = function (actiontype, newPost, listScope) {

        	$rootScope.$ListService.refreshListItem( $scope.actualDocument, true);

            $scope.formData['formData']['buttonIsEnable'] = false;

            DocumentResource.putDocument({documentId: $scope.formData['formData']['documentID']}, newPost
                , function (response) {

            		$rootScope.$ListService.refreshListItem(response, true);
                    $scope.formData['formData']['documentID'] = response.id;

                    $stateParams.documentId = $scope.formData['formData']['documentID'];
                    if (actiontype !== 'powerpromote' && $state.current.name == 'document') {
                        $location.path('/documents/document').search($stateParams);
                    }

                    $scope.actualDocument = response;

                    if ($scope.isNew) {
            		 	$rootScope.$MessageService.writeSuccess($filter('translate')("message.document.create.title"), $filter('translate')("message.document.create.success"), undefined, undefined);
                    } else {
            		 	$rootScope.$MessageService.writeSuccess($filter('translate')("message.document.save.title"), $filter('translate')("message.document.save.success"), undefined, undefined);
                    }

                    if (actiontype === 'powerpromote') {
                        $scope.cancelCheckout(response.id).$promise.then(function() {
                            $scope.powerPromote(response.id, listScope).$promise.then(function(doc) {
                            	$rootScope.$ListService.refreshListItem(doc, false);

                                $scope.formData['formData']['documentID'] = doc.id;
                                $stateParams.documentId = $scope.formData['formData']['documentID'];
                                if (actiontype !== 'powerpromote' && $state.current.name == 'document') {
                                    $location.path('/documents/document').search($stateParams);
                                }

                                $scope.actualDocument = doc;
                            });
                        });
                    } else {
                        //$scope.cancelCheckout(response.id).$promise.then(function(doc) {
                        //    //$rootScope.$ListService.refreshListItem(ccheck.$$state.value, false);
                        //    $rootScope.$ListService.refreshListItem(doc, false);
                        //    $scope.formData['formData']['buttonIsEnable'] = true;
                        //});
                    	$rootScope.$ListService.refreshListItem(response, false);
                        $scope.formData['formData']['buttonIsEnable'] = true;
                    }



                }, function (error) {
        		 	$rootScope.$MessageService.writeException(error);
                    $scope.formData['formData']['buttonIsEnable'] = true;
                    $rootScope.$ListService.refreshListItem( $scope.actualDocument, false);
                });


                if (actiontype === 'powerpromote') {
                    $timeout(function () {
                        $scope.goBackFromNewDocument();
                    }, 0);
                }
        }

        $scope.saveEditor = function (actiontype, xmlResult, listScope) {

            if (angular.isDefined(xmlResult)) {

                $scope.formData['formData']['buttonIsEnable'] = false;

                $rootScope.$ListService.refreshListItem( $scope.actualDocument, true);

                if ($scope.isFirstSave) {
                    DocumentResource.postDocumentXml({documentId: $scope.formData['formData']['documentID']}, {content: $scope.file}
                        , function (response) {

                            $scope.isFirstSave = false;

                            $rootScope.$ListService.refreshListItem(response, true);
                            $scope.formData['formData']['documentID'] = response.id;

                            $stateParams.documentId = $scope.formData['formData']['documentID'];
                            if (actiontype !== 'powerpromote' && $state.current.name == 'document') {
                                $location.path('/documents/document').search($stateParams);
                            }

                            $scope.actualDocument = response;


                            DocumentResource.documentCheckout({documentId: $scope.formData['formData']['documentID']}
                                , function (res) {

                                    //$scope.formData['formData']['documentID'] = res.id;

                                    $stateParams.documentId = $scope.formData['formData']['documentID'];
                                    if (actiontype !== 'powerpromote' && $state.current.name == 'document') {
                                        $location.path('/documents/document').search($stateParams);
                                    }

                                    $scope.formData['formData']['lock_owner'] = res.lock_owner;

                                    $scope.actualDocument = res;

                                    if ($scope.isNew) {
                            		 	$rootScope.$MessageService.writeSuccess($filter('translate')("message.document.create_content.title"), $filter('translate')("message.document.create_content.success"), undefined, undefined);
                                    }
                                    else {
                            		 	$rootScope.$MessageService.writeSuccess($filter('translate')("message.document.save_content.title"), $filter('translate')("message.document.save_content.success"), undefined, undefined);
                                    }

                                    $scope.isNew = false;

                                    if (actiontype === 'powerpromote') {
                                        //$scope.powerPromote(response.id, listScope).$promise.then(function (doc) {
                                        //	$rootScope.$ListService.refreshListItem(doc, false);
                                        //});
                                        $scope.cancelCheckout(res.id).$promise.then(function() {
                                            $scope.powerPromote(res.id, listScope).$promise.then(function(doc) {
                                                $rootScope.$ListService.refreshListItem(doc, false);

                                                $scope.formData['formData']['documentID'] = doc.id;
                                                $stateParams.documentId = $scope.formData['formData']['documentID'];
                                                if (actiontype !== 'powerpromote' && $state.current.name == 'document') {
                                                    $location.path('/documents/document').search($stateParams);
                                                }

                                                $scope.actualDocument = doc;
                                            });
                                        });
                                    }
                                    else {
                                    	$rootScope.$ListService.refreshListItem(res, false);
                                        $scope.formData['formData']['buttonIsEnable'] = true;
                                    }

                                }, function (error) {
                                	var title = "";
                        		 	$rootScope.$MessageService.writeException(error);
                                    $scope.formData['formData']['buttonIsEnable'] = true;
                                    $rootScope.$ListService.refreshListItem($scope.actualDocument, false);
                                });

                        }, function (error) {
                		 	$rootScope.$MessageService.writeException(error);
                            $scope.formData['formData']['buttonIsEnable'] = true;
                            $rootScope.$ListService.refreshListItem($scope.actualDocument, false);
                        });

                }
                else {
                    if (angular.isDefined(xmlResult)) {
                        DocumentResource.putDocumentXml({documentId: $scope.formData['formData']['documentID']}, {content: $scope.file}
                            , function (responseDoc) {

                                $scope.formData['formData']['documentID'] = responseDoc.id;

                                $stateParams.documentId = $scope.formData['formData']['documentID'];
                                if (actiontype !== 'powerpromote' && $state.current.name == 'document') {
                                    $location.path('/documents/document').search($stateParams);
                                }

                                $scope.actualDocument = responseDoc;

                                if ($scope.isNew) {
                        		 	$rootScope.$MessageService.writeSuccess($filter('translate')("message.document.create_content.title"), $filter('translate')("message.document.create_content.success"), undefined, undefined);
                                }
                                else {
                        		 	$rootScope.$MessageService.writeSuccess($filter('translate')("message.document.save_content.title"), $filter('translate')("message.document.save_content.success"), undefined, undefined);
                                }


                                if (actiontype === 'powerpromote') {
                                    $scope.powerPromote(responseDoc.id, listScope).$promise.then(function(doc) {
                                    	$rootScope.$ListService.refreshListItem(doc, false);

                                        $scope.formData['formData']['documentID'] = doc.id;
                                        $stateParams.documentId = $scope.formData['formData']['documentID'];
                                        if (actiontype !== 'powerpromote' && $state.current.name == 'document') {
                                            $location.path('/documents/document').search($stateParams);
                                        }

                                        $scope.actualDocument = doc;
                                    });
                                }
                                else if (actiontype === 'publish') {

                                }
                                else {
                                	$rootScope.$ListService.refreshListItem(responseDoc, false);
                                    $scope.formData['formData']['buttonIsEnable'] = true;
                                }



                            }, function (error) {
                            	var title = "";
                    		 	$rootScope.$MessageService.writeException(error);
                                $scope.formData['formData']['buttonIsEnable'] = true;
                                $rootScope.$ListService.refreshListItem( response, false);
                            });
                    }
                }

                if (actiontype === 'powerpromote') {
                    $timeout(function () {
                    	$scope.goBackFromNewDocument();
                        }, 0);
                }
            }
        }

        $scope.saveWithoutChange = function (actiontype, listScope) {


        	$rootScope.$ListService.refreshListItem( $scope.actualDocument, true);

            if (actiontype === 'powerpromote') {

                $scope.cancelCheckout($scope.formData['formData']['documentID']).$promise.then(function(response) {

                    $scope.formData['formData']['documentID'] = response.id;

                    $stateParams.documentId = $scope.formData['formData']['documentID'];
                    if (actiontype !== 'powerpromote' && $state.current.name == 'document') {
                        $location.path('/documents/document').search($stateParams);
                    }

                    $scope.actualDocument = response;

                    $scope.isNew = false;

                    $scope.powerPromote(response.id, listScope).$promise.then(function(doc) {

                        $rootScope.$ListService.refreshListItem(doc, false);

                        $scope.formData['formData']['documentID'] = doc.id;
                        $stateParams.documentId = $scope.formData['formData']['documentID'];
                        if (actiontype !== 'powerpromote' && $state.current.name == 'document') {
                            $location.path('/documents/document').search($stateParams);
                        }

                        $scope.actualDocument = doc;
                    });


                }, function (error) {
                    var title = "";
                    $rootScope.$MessageService.writeException(error);
                    $scope.formData['formData']['buttonIsEnable'] = true;
                    $rootScope.$ListService.refreshListItem( $scope.actualDocument, false);
                });



            }
            else {
                $scope.cancelCheckout($scope.formData['formData']['documentID']).$promise.then(function() {
                    $scope.formData['formData']['buttonIsEnable'] = true;
                }, function (error) {
                	var title = "";
        		 	$rootScope.$MessageService.writeException(error);
                    $scope.formData['formData']['buttonIsEnable'] = true;
                    $rootScope.$ListService.refreshListItem( $scope.actualDocument, false);
                });
            }

            if (actiontype === 'powerpromote') {
                $timeout(function () {
                    $scope.goBackFromNewDocument();
                }, 0);
            }

        }
        
        $scope.isTabValid = function(tab) {
        	if(angular.isDefined($scope.activeTabObject[tab]) && angular.isDefined($scope.activeTabObject[tab].dynamicForm)
        		&& angular.isDefined($scope.activeTabObject[tab].dynamicForm.$valid)) {
        		return $scope.activeTabObject[tab].dynamicForm.$valid;
        	}
        	return true;
        };
        
        $scope.isTabDirty = function(tab) {
        	if(angular.isDefined($scope.activeTabObject[tab]) && angular.isDefined($scope.activeTabObject[tab].dynamicForm)
        			&& angular.isDefined($scope.activeTabObject[tab].dynamicForm.$dirty)) {
        		return $scope.activeTabObject[tab].dynamicForm.$dirty;
        	}
        	return false;
        };
               
        $scope.checkLinks = function() {
        	//$('iframe').each(function() {
        	//	$(this).removeAttr('title');
        	//});
            $scope.ok = true;

            var checkPromise = $q(function(resolve, reject) {
                var keys = _.keys(CKEDITOR.instances);

                if (keys.length > 0 && angular.isDefined(CKEDITOR.instances[keys[0]].document)) {
                    for (var index = 0; index < keys.length; index++) {
                        $scope.checkLink(index, keys);
                    }
                }
                else if (keys.length == 0 || angular.isUndefined(CKEDITOR.instances[keys[0]].document)) {
                    $timeout(function () {
                        $scope.checkLinks();
                    }, 1000);
                }
                ;

                $timeout(function () {
                    resolve();
                }, 2000);

            });

            checkPromise.then(function(){
                if ($scope.ok) {
                    var title = $filter('translate')('message.document.checklink.title');
                    var message = $filter('translate')('message.document.checklink.success');
                    $rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);
                }
            });
        };
        
        $scope.checkLink = function(index, keys) {
        	var body = CKEDITOR.instances[keys[index]].document.getBody().getHtml();


        	$(body).find('a').each(function() {
        		var inner = $(this).text();
        		var name = $(this).attr('href');
        		if(angular.isDefined(name) && (! (name.search('http://') === 0 || name.search('file://') === 0 || name.search('mailto:') === 0 || name.search('#') === 0 || name.search('dict=general') === 0 || name.search('term?') === 0))) {

                    var url = $rootScope.$DetailService.getLink(name, $scope.formData['formData'].language_code.id);
        			var element = $(this);
        			$rootScope.overlayClass = 'notfound';
        			$http.get(url).
        			then(function(response) {
        				if(response.status == 200) {        				  
        					//CKEDITOR.instances[keys[index]].document['$'].body.innerHTML = body;
        					//$rootScope.$MessageService.writeSuccess(inner, 'OK ('+ url + ')', undefined, undefined);        					  
        				} else {
        					$rootScope.$MessageService.writeError(inner, 'ERROR ('+ url + ')', undefined, undefined);
                            $scope.ok = false;
        				}
        			}, function(error) {
        				$rootScope.$MessageService.writeError(inner, 'ERROR ('+ url + ')', undefined, undefined);
                            $scope.ok = false;
        			});        			
        		}
        	});


        };       

        // CHECK LINKS AFTER LOAD
        //$timeout(function(){ $scope.checkLinks(); }, 2000);
        
        $scope.save = function(actiontype) {

            if ($scope.isTabValid('Metadata') && $scope.isTabValid('Editor')) {

                $rootScope.overlayClass = 'saving';

                var newPost = $rootScope.transformResponse('formData', 'form');

                //if(angular.isDefined($scope.activeTabObject['Editor'])) {
                    var promiseEditor = $rootScope.transformResponseToXml('editorData', 'editor', $scope.xmlContent);
                //}
                //else {
                //    var promiseEditor = $q(function(resolve, reject) {
                //        setTimeout(function () {
                //            resolve();
                //        }, 0);
                //    });
                //}


                //if(angular.isDefined($scope.activeTabObject['Editor'])) {

                    //$rootScope.transformResponseToXml('editorData', 'editor', $scope.xmlContent).then(function(response) {

                    promiseEditor.then(function(response) {
                        var xmlResult = response;
                        //$scope.xmlContent = xmlResult;

                        if (angular.isDefined(xmlResult)) {
                            $scope.file = new File([(new XMLSerializer()).serializeToString(xmlResult)], $scope.formData['formData'].name, {type: "text/xml"});
                        }


                        $scope.isDocumentSave = true;

                        // Change metadata and content
                        if (($scope.isTabDirty('Metadata') && $scope.isTabDirty('Editor')) || $scope.isNew || $scope.hasCreateNewVersion || $scope.formData['formData'].current_state === 5) {
                            $scope.saveAllBackground(actiontype, newPost, xmlResult, $scope);
                        }
                        // Change metadata
                        else if ($scope.isTabDirty('Metadata')) {
                            $scope.saveMetadataBackground(actiontype, newPost, $scope);

                        }
                        // Change content
                        else if ($scope.isTabDirty('Editor')) {

                            $scope.saveEditorBackground(actiontype, xmlResult, $scope);
                        }
                        // No change
                        else {

                            $scope.saveWithoutChangeBackground(actiontype, $scope);

                        }

                        $scope.activeTabObject['Metadata'].dynamicForm.$setPristine();

                        if(angular.isDefined($scope.activeTabObject['Editor'])) {
                            $scope.activeTabObject['Editor'].dynamicForm.$setPristine();
                        }
                    });

                //}


            }
            else {

                if ($scope.active["metadata"]) {
                    $('#dynamicForm').addClass('submitted');

                    if ($scope.isTabValid('Metadata') && ! $scope.isTabValid('Editor')) {

                        $('#dynamicEditorForm').addClass('submitted');

                        if (angular.isDefined($scope.activeTabObject[tab])) {
                            $scope.activeTabObject[tab].dynamicForm.runValid = new Date();
                        }
                        $scope.setTab("Editor");
                    }
                }
                else if ($scope.active["editor"]) {
                    $('#dynamicEditorForm').addClass('submitted');

                }
                else {
                    $('#dynamicForm').addClass('submitted');
                    $('#dynamicEditorForm').addClass('submitted');

                    $scope.setTab("Editor");
                }

                $scope.validateForm(true);
            }

        }

        $scope.valid = function() {

            if ($scope.formData['formData'] && $scope.formData['formData']['form_readonly'] !== true) {

                $('#dynamicForm').addClass('submitted');

                $scope.validateForm();
            }
        }

        $scope.validateForm = function(validEditor) {


            var title = $filter('translate')("message.validation.title");

            var tab = "";

            if ($scope.active["metadata"] && $('#dynamicForm').hasClass("submitted")) {
                tab = "Metadata";
            }
            else if ($scope.active["editor"] && $('#dynamicEditorForm').hasClass("submitted")) {
                tab = "Editor";
            }

            if (  $rootScope.errorMessage[tab] && $rootScope.errorMessage[tab] !== "") {
                $rootScope.$MessageService.writeValidationError(title, $rootScope.errorMessage[tab], undefined, undefined);
            }

            var firstInvalid = $(document).find('.ng-invalid');

            // if we find one, set focus
            if (firstInvalid && firstInvalid[1]) {

                if ($(firstInvalid[1]).is("div")) {
                    $("html, body").scrollTop($(firstInvalid[1]).offset().top-200);
                }
                else {
                    // $('html,body').unbind().animate({scrollTop: $(firstInvalid[1]).offset().top-200},'fast');
                    $("html, body").scrollTop($(firstInvalid[1]).offset().top-200);
                    firstInvalid[1].focus();
                }
            }
        }

        $scope.save_publish = function() {
            $scope.save('publish')
        };

        $scope.save_powerPromote = function (){
            $scope.save('powerpromote');
        };

        $scope.powerPromote = function (id, listScope) {

            return DocumentResource.documentPowerPromote({documentId: id},
                function (response) {
        		 	$rootScope.$MessageService.writeSuccess($filter('translate')("message.document.powerpromote.title"), $filter('translate')("message.document.powerpromote.success"), undefined, undefined);

        		 	$rootScope.$ListService.refreshListItem(response, true);

                    $scope.formData['formData']['buttonIsEnable'] = true;

                }, function (error) {
                	var title = "";
        		 	$rootScope.$MessageService.writeException(error);

                    $scope.formData['formData']['buttonIsEnable'] = true;
        		 	$rootScope.$ListService.refreshListItem( $scope.actualDocument, false);
                });

        }


        $scope.createNewVersion = function () {
            DocumentResource.documentCheckout({documentId: $stateParams.documentId}
                , function (res) {

                    $scope.actualDocument = res;

                    $scope.hasCreateNewVersion = true;

                    $scope.formData['formData']['form_readonly'] = $scope.formData['editorData']['form_readonly'] = false;
                    $scope.formData['formData']['lock_owner'] = res.lock_owner;

                }, function (error) {
                	var title = "";
        		 	$rootScope.$MessageService.writeException(error);
                });

        }

        var cancelFunc = function(disable) {
            $rootScope.$ListService.refreshListItem( $scope.actualDocument, disable, undefined, true);

            $scope.goBackFromNewDocument();
        }
            
        $scope.cancel = function(actiontype) {

            if (angular.isDefined($scope.activeTabObject['Editor']) && angular.isDefined($scope.activeTabObject['Editor'].dynamicForm) && $scope.activeTabObject['Editor'].dynamicForm.$dirty ||
                angular.isDefined($scope.activeTabObject['Metadata']) && angular.isDefined($scope.activeTabObject['Metadata'].dynamicForm) && $scope.activeTabObject['Metadata'].dynamicForm.$dirty) {

                var modalInstance = $modal.open({
                    animation: false,
                    templateUrl: 'documents/questionModal.tpl.html',
                    controller: 'QuestionModalCtrl',
                    size: 'lg',
                    resolve: {
                        title: function () {
                            return $filter('translate')("modal.document.message.question.title");
                        },
                        text: function () {
                            return $filter('translate')("modal.document.message.question.text");
                        }
                    }
                });

                modalInstance.result.then(function (value) {
                    if (value === "save") {

                        $scope.save ();
                        if ($scope.isTabValid('Metadata') && $scope.isTabValid('Editor')) {

                            cancelFunc(true);
                        }
                    }
                    else if (value === "notsave"){
                        cancelFunc(false);
                    }
                });

            }
            else {

                cancelFunc(false);
            }
        }


        $scope.loadData = function (name) {
            $scope.activeTabObject[name] = this;
        }

        $scope.processForm = function () {
            /* Handle the form submission... */
            //console.log(dynamicForm.$valid);
            //console.log(dynamicForm);
            //console.log($scope.form);
        };


    }])

    .controller( 'TreeModalCtrl', ['$scope', '$rootScope', '$modalInstance', 'CodeTablesResource', 'origSelected', 'codetable', 'name', 'options', 'multi', 'folder', 'label', 'typeNodes','utilityService', '$filter', '$q',
        function($scope, $rootScope, $modalInstance, CodeTablesResource, origSelected, codetable, name, options, multi, folder, label, typeNodes, utilityService, $filter, $q) {

            $scope.isModal = true;

            if (multi === "true") {
                $scope.origSelectedNodes = angular.copy(origSelected);
                $scope.origSelectedNode = undefined;
            }
            else {
                if (angular.isDefined(origSelected) && origSelected.length > 0) {

                    $scope.origSelectedNode = angular.copy(origSelected[0]);
                }
                else {
                    $scope.origSelectedNode = {};
                }

                $scope.origSelectedNodes = undefined;
            }


        $scope.label = label;
        $scope.expandedNodes = [];
        $scope.predicate = "";
        $scope.comparator = false;

        $scope.treeOptions = {
            nodeChildren: "children",
            dirSelectable: (folder === "true"),
            multiSelection: (multi === "true")
        }

        $scope.showSelected = function(node, selected) {
            if (!(multi === "true")) {
                if (selected) {
                    $scope.origSelectedNodes = [node];
                }
                else {
                    $scope.origSelectedNodes = [];
                }
            }
        };

        $scope.getFullPath = function(node, path, parent) {

            if (angular.isDefined(node.children)) {

                if (angular.isDefined(path)) {
                    node.path = path + "/" + node.text;
                }
                else {
                    node.path = node.text;
                }

                ////node.parent = parent;
                node.parent = parent;

                angular.forEach(node.children, function(value, key) {

                    $scope.getFullPath(value, node.path, node.id);
                });

            }
            else{
                if (angular.isDefined(path)) {
                    node.path = path + "/" + node.text;
                }
                else {
                    node.path = node.text;
                }

                ////node.parent = parent;
                node.parent = parent;
            }


        };

        $scope.remove = function(node) {
            var index = $scope.origSelectedNodes.indexOf(node);
            $scope.origSelectedNodes.splice(index, 1);
        }

        //$scope.expandeAll = function(node) {
        //
        //    if (_.isArray(node) ) {
        //        angular.forEach(node, function(value, key) {
        //
        //            $scope.expandeAll(value);
        //        });
        //    }
        //    else {
        //        $scope.expandedNodes.push(node);
        //
        //        if (angular.isDefined(node.children)) {
        //
        //            angular.forEach(node.children, function(value, key) {
        //
        //                $scope.expandeAll(value);
        //            });
        //        }
        //    }
        //
        //};

        $scope.addParent = function (node, list) {
            list.push(node);

            if (angular.isDefined(node) && (angular.isDefined(node.parent)) && (node.parent !== null)) {

                if ($filter('filter')(list, {value: node.parent.value + ""}, true).length === 0) {
                    $scope.addParent(utilityService.getObject($scope.treedata, 'value', node.parent), list);
                }
            }
        }

        $scope.expandSelected = function(list) {
            var selectList = [];

            angular.forEach(list, function(value, key) {
                //item.text = '<p>' + item.text + '</p>';

                if ($filter('filter')(selectList, {value: value.value + ""}, true).length === 0) {

                    if (value.parent === null) {

                        selectList.push(value);
                    }
                    else {
                        // $scope.addParent(value.parent, selectList);
                        $scope.addParent(utilityService.getObject($scope.treedata, 'value', value.parent), selectList);
                    }
                }
            });


            return selectList;
        }


        $scope.showToggle = function(node, expanded, parentNode, index, first, middle, last, odd, even) {
           // console.log($scope.origSelectedNodes);
           // console.log($scope.origSelectedNode);
        };

        $scope.isEmpty = function(node) {
            return _.isEmpty(node);
        }


        $scope.$watch('predicate', function(value) {

            if (value !== "" && value.length > 2) {

                $scope.filtredTreeData = [];
                $filter('cutTree')($scope.treedata, value, $scope.filtredTreeData, []);

                //$scope.expandedNodes = $scope.expandSelected($scope.filtredTreeData);
                $scope.expandedNodes = $scope.filtredTreeData;
            }
        });

        if (codetable !== 'undefined') {
            var promiseCodetable = CodeTablesResource.list({
                operation: 'codetables',
                codetable: codetable,
                id: 'root',
                nodes: typeNodes}).$promise;

        }
        else {

            var func = function() {
                return $q(function(resolve) {
                    resolve(options);
                });
            };

            var promiseCodetable = func();

        }

        promiseCodetable.then(function (response) {

            if (response.data != undefined)
            {
                $scope.treedata = response.data;
            }
            else if (_.isArray(response) ) {
                $scope.treedata = response;
            }
            else  {
                $scope.treedata = [response];
            }

            angular.forEach($scope.treedata, function(value, key) {

                $scope.getFullPath(value, undefined, null);
            });


            $scope.expandedNodes = [];
            if (angular.isDefined($scope.origSelectedNodes) && $scope.origSelectedNodes.length > 0) {


                var backModel = $scope.origSelectedNodes;
                $scope.origSelectedNodes = [];

                angular.forEach(backModel, function (value, key) {

                    $scope.result = utilityService.getObject($scope.treedata, 'value', value);
                    $scope.origSelectedNodes.push($scope.result);

                });
                $scope.expandedNodes = $scope.expandSelected($scope.origSelectedNodes);

            }
            else if (angular.isDefined($scope.origSelectedNode) && ! $scope.isEmpty($scope.origSelectedNode)){


                var backModel = $scope.origSelectedNode;
                $scope.origSelectedNode = {};

                $scope.result = utilityService.getObject($scope.treedata, 'value', backModel);

                if ($scope.result !== null) {


                    $scope.origSelectedNode = $scope.result;

                    $scope.expandedNodes = $scope.expandSelected([$scope.origSelectedNode]);

                }
            }
        }).catch(function(error) {
            var title = "";
            $rootScope.$MessageService.writeException(error);
        });


        $scope.ok = function () {
            if (multi === "true") {
                $scope.isModal = false;
                $modalInstance.close($scope.origSelectedNodes);
            }
            else {
                $scope.isModal = false;
                $modalInstance.close([$scope.origSelectedNode]);
            }
        };

        $scope.cancel = function () {
            $scope.isModal = false;
            $modalInstance.dismiss('cancel');
        };

    }])

    .controller( 'TreeModalEditorCtrl', ['$scope', '$rootScope', 'CodeTablesResource', 'utilityService', '$filter', '$q', 'ModalService',
        function($scope, $rootScope, CodeTablesResource, utilityService, $filter, $q, ModalService) {

            $scope.isModal = false;

            var codetable = "dd_general";
            var multi = "false";
            var folder = "true";
            var origSelected = [];

            $scope.$watch('predicate', function(value) {

                if (angular.isDefined(value) && value !== "" && value.length > 2) {

                    ModalService.filtredTreeData = [];
                    $filter('cutTree')(ModalService.treedata, value, ModalService.filtredTreeData);

                    ModalService.expandedNodes = ModalService.expandSelected(ModalService.filtredTreeData);
                }
            });

            if (codetable !== 'undefined') {
                var promiseCodetable = CodeTablesResource.list({
                    operation: 'codetables',
                    codetable: codetable,
                    id: 'root',
                    nodes: 'nodes'}).$promise;

            }
            else {

                var func = function() {
                    return $q(function(resolve) {
                        resolve(options);
                    });
                };

                var promiseCodetable = func();

            }

            promiseCodetable.then(function (response) {

                if (response.data != undefined)
                {
                    ModalService.treedata = response.data;
                }
                else if (_.isArray(response) ) {
                    ModalService.treedata = response;
                }
                else  {
                    ModalService.treedata = [response];
                }

                angular.forEach(ModalService.treedata, function(value, key) {

                    ModalService.getFullPath(value, undefined, null);
                });


                ModalService.expandedNodes = [];
                if (angular.isDefined(ModalService.origSelectedNodes) && ModalService.origSelectedNodes.length > 0) {


                    var backModel = ModalService.origSelectedNodes;
                    ModalService.origSelectedNodes = [];

                    angular.forEach(backModel, function (value, key) {

                        ModalService.result = utilityService.getObject(ModalService.treedata, 'value', value);
                        ModalService.origSelectedNodes.push(ModalService.result);

                    });
                    ModalService.expandedNodes = ModalService.expandSelected(ModalService.origSelectedNodes);

                }
                else if (angular.isDefined(ModalService.origSelectedNode) && ! ModalService.isEmpty(ModalService.origSelectedNode)){


                    var backModel = ModalService.origSelectedNode;
                    ModalService.origSelectedNode = {};

                    ModalService.result = utilityService.getObject(ModalService.treedata, 'value', backModel);

                    if (ModalService.result !== null) {


                        ModalService.origSelectedNode = ModalService.result;

                        ModalService.expandedNodes = ModalService.expandSelected([ModalService.origSelectedNode]);

                    }
                }





            }).catch(function(error) {
                var title = "";
                $rootScope.$MessageService.writeException(error);
            });
    }])

    .filter('cutTree', ['$filter',function ($filter) {
        return function (tree, filter, filtredData, parents) {

            angular.forEach(tree, function(item) {

                if ((item.text.toLowerCase().indexOf(filter.toLowerCase())) > -1) {

                    angular.forEach(parents, function (value, key) {

                        if ($filter('filter')(filtredData, {value: value.value + ""}, true).length === 0) {
                            filtredData.push(value);
                        }
                    });

                    if ($filter('filter')(filtredData, {value: item.value + ""}, true).length === 0) {
                        filtredData.push(item);
                    }

                }
                parents.push(item);

                 $filter('cutTree')(item.children, filter,filtredData, parents);

            });
        };
    }])

    .service('TemplateService', ['$http', '$q', '$filter', '$rootScope', function ($http, $q, $filter, $rootScope) {


        this.getPortals = function ($scope) {
            var deferred = $q.defer();

            return $http({
                method: "GET",
                url: $rootScope.wcmConfig.backend + "?id=portals",
                headers: { 'Content-Type': 'application/json' }
            }).success(function (data) {

                if (data.data != undefined)
                {
                    $scope.portals = data.data;
                }
                else {
                    $scope.portals = [data];
                }

            }).error(function (error) {
            	$rootScope.$MessageService.writeException(error);
            });
        };

        this.getTemplates = function ($scope, idTemplates) {
            var deferred = $q.defer();

            return $http({
                method: "GET",
                url: $rootScope.wcmConfig.backend + "?id=portal_templates&params=" + idTemplates,
                headers: { 'Content-Type': 'application/json' }
            }).success(function (data) {
                if (data.data != undefined) {
                    $scope.templates = data.data;
                } else {
                    $scope.templates = [data];
                }
            }).error(function (error) {
            	$rootScope.$MessageService.writeException(error);
            });
        };


    }]);
