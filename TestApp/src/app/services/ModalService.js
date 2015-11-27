angular.module('service-modal', ['ui.router'])
    .service('ModalService', ['$q', '$rootScope', '$state', '$stateParams', 'CommonResource', 'DocumentsResource', '$filter', 'utilityService',
        function ($q, $rootScope, $state, $stateParams, CommonResource, DocumentsResource, $filter, utilityService) {


            var codetable = "ct_navigation_ia";
            var multi = "false";
            var folder = "true";
            var origSelected = [];


            if (multi === "true") {
                this.origSelectedNodes = angular.copy(origSelected);
                this.origSelectedNode = undefined;
            }
            else {
                if (angular.isDefined(origSelected) && origSelected.length > 0) {

                    this.origSelectedNode = angular.copy(origSelected[0]);
                }
                else {
                    this.origSelectedNode = {};
                }

                this.origSelectedNodes = undefined;
            }


            this.label = "asdfasdfasdfasdfasdf";
            this.expandedNodes = [];
            this.predicate = "";
            this.comparator = false;

            this.treeOptions = {
                nodeChildren: "children",
                dirSelectable: (folder === "true"),
                multiSelection: (multi === "true")
            }

            this.showSelected = function(node, selected) {
                if (!(multi === "true")) {
                    if (selected) {
                        this.origSelectedNodes = [node];
                    }
                    else {
                        this.origSelectedNodes = [];
                    }
                }
            };

            function getFullPath(node, path, parent) {

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

                        getFullPath(value, node.path, node.id);
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

            this.getFullPath = function (node, path, parent) {
                getFullPath(node, path, parent);
            }

            this.remove = function(node) {
                var index = this.origSelectedNodes.indexOf(node);
                this.origSelectedNodes.splice(index, 1);
            }

            function addParent(node, list) {

                if (node !== null) {
                    list.push(node);

                    if (angular.isDefined(node) && (angular.isDefined(node.parent)) && (node.parent !== null)) {

                        if ($filter('filter')(list, {value: node.parent.value + ""}, true).length === 0) {
                            addParent(utilityService.getObject($rootScope.$ModalService.treedata, 'value', node.parent), list);
                        }
                    }
                }
            }
            this.addParent = function (node, list) {
                addParent(node, list);
            }

            this.expandSelected = function(list) {
                var selectList = [];

                angular.forEach(list, function(value, key) {
                    //item.text = '<p>' + item.text + '</p>';

                    if ($filter('filter')(selectList, {value: value.value + ""}, true).length === 0) {

                        if (value.parent === null) {

                            selectList.push(value);
                        }
                        else {
                            addParent(utilityService.getObject($rootScope.$ModalService.treedata, 'value', value.parent), selectList);
                        }
                    }
                });


                return selectList;
            }

            this.showToggle = function(node, expanded, parentNode, index, first, middle, last, odd, even) {

            };

            this.isEmpty = function(node) {
                return _.isEmpty(node);
            }

            this.onSelected = function(node, selected, parentNode) {
                if(! selected) {
                    document.getElementById('selectItem').value = undefined;
                    document.getElementById('selectItemText').value = undefined;
                } else {
                    document.getElementById('selectItem').value = node.value;
                    document.getElementById('selectItemText').value = node.text;
                }
            };
        }]);