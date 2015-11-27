angular.module('common.utility', [])

.factory('utilityService', function($filter) {
    return {
        getObject: function (theObject, property, value) {


            var compResult = null;
            var result = null;

            var getObject = function (theObject, property, value) {
                if (theObject instanceof Array) {
                    for (var i = 0; i < theObject.length; i++) {
                        result = getObject(theObject[i], property, value);
                    }
                }
                //else if (theObject !== null && angular.isDefined(theObject.children)) {//(_.has(theObject, 'children')) {
                //    getObject(theObject.children, property, value);
                //}
                else {
                    for (var prop in theObject) {

                        if (prop !== 'parent') {
                            if (angular.equals(prop, property)) {

                                if (angular.isDefined(value) && angular.isDefined(value.value)) {
                                    value = value.value;
                                }

                                if (theObject[prop] + "" === value + "") {

                                    compResult = theObject;
                                    return theObject;
                                }
                            }
                            if (theObject[prop] instanceof Object || theObject[prop] instanceof Array)
                                result = getObject(theObject[prop], property, value);
                        }
                    }
                }
                return compResult;
            }

            //console.log(getObject(theObject, property, value));

            return getObject(theObject, property, value);

        },

        getObjectParent: function (theObject, property, value, parent) {


            var compResult = null;
            var result = null;

            var getObjectParent = function (theObject, property, value, parent) {
                if (theObject instanceof Array) {
                    for (var i = 0; i < theObject.length; i++) {
                        result = getObjectParent(theObject[i], property, value, parent);
                    }
                }
                //else if (theObject !== null && angular.isDefined(theObject.children)) {//(_.has(theObject, 'children')) {
                //    getObject(theObject.children, property, value);
                //}
                else {
                    for (var prop in theObject) {

                        if (prop !== 'parent') {
                            if (angular.equals(prop, property)) {

                                if (angular.isDefined(value) && angular.isDefined(value.value)) {
                                    value = value.value;
                                }

                                if (theObject[prop] + "" === value + "") {

                                    compResult = parent;
                                    return theObject;
                                }
                            }
                            if (theObject[prop] instanceof Object || theObject[prop] instanceof Array)
                                result = getObjectParent(theObject[prop], property, value, theObject.controls);
                        }
                    }
                }
                return compResult;
            }

            //console.log(getObject(theObject, property, value));

            return getObjectParent(theObject, property, value, theObject);

        },

        getObjectAll: function (theObject, property, value, parent) {


            var compResult = [];
            var result = null;

            var getObjectAll = function (theObject, property, value, parent) {
                if (theObject instanceof Array) {
                    for (var i = 0; i < theObject.length; i++) {
                        result = getObjectAll(theObject[i], property, value, parent);
                    }
                }
                //else if (theObject !== null && angular.isDefined(theObject.children)) {//(_.has(theObject, 'children')) {
                //    getObject(theObject.children, property, value);
                //}
                else {
                    for (var prop in theObject) {

                        if (prop !== 'parent') {
                            if (angular.equals(prop, property)) {

                                if (angular.isDefined(value) && angular.isDefined(value.value)) {
                                    value = value.value;
                                }

                                //if (theObject[prop] + "" === value + "") {
                                if (angular.isUndefined(theObject.controls)) {
                                    compResult.push(theObject);
                                    //return theObject;
                                }
                            }
                            if (theObject[prop] instanceof Object || theObject[prop] instanceof Array)
                                result = getObjectAll(theObject[prop], property, value, theObject.controls);
                        }
                    }
                }
                //return compResult;
            }

            //console.log(getObject(theObject, property, value));

            getObjectAll(theObject, property, value, theObject);
            return compResult;

        },

        getIndex: function (theObject, property, value) {

            var resultParent = this.getObjectParent(theObject, property, value);
            var sameCat = $filter('filter')(resultParent, {name: '' + value.split('__')[0]});

            var index = _.findIndex(sameCat, {'name': value});
            return (index + 1) + "/" + sameCat.length;
        },

        getIndexAll: function (theObject, property, group, formData) {

            angular.forEach(group, function(value, key) {
                var index = _.findIndex(group, {'name': value.name});

                console.log(group.length);
                console.log(index + 1);

                formData[value.name + "_order"] = (index + 1) + "/" + group.length;
            });
        }
     
    };

})

    .directive('appFilereader', function($q) {
        var slice = Array.prototype.slice;

        return {
            restrict: 'A',
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                if (!ngModel) return;

                ngModel.$render = function() {};

                element.bind('change', function(e) {
                    var element = e.target;

                    $q.all(slice.call(element.files, 0).map(readFile))
                        .then(function(values) {
                            if (element.multiple) ngModel.$setViewValue(values);
                            else ngModel.$setViewValue(values.length ? values[0] : null);
                        });

                    function readFile(file) {
                        var deferred = $q.defer();

                        var reader = new FileReader();
                        reader.onload = function(e) {
                            deferred.resolve(e.target.result);
                        };
                        reader.onerror = function(e) {
                            deferred.reject(e);
                        };
                        reader.readAsDataURL(file);

                        return deferred.promise;
                    }

                }); //change

            } //link
        }; //return
    })



    .directive('onReadFile', function ($parse, $rootScope) {
        return {
            restrict: 'A',
            scope: false,
            link: function(scope, element, attrs) {
                var fn = $parse(attrs.onReadFile);

                element.on('change', function(onChangeEvent) {
                    var reader = new FileReader();

                    reader.onload = function(onLoadEvent) {
                        scope.$apply(function() {
                            fn(scope, {$fileContent:(onChangeEvent.srcElement || onChangeEvent.target).files[0]});
                        });
                    };
                    reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
                });
            }
        };
    })


.directive('ckEditor', [function () {
    return {
        require: '?ngModel',
        link: function ($scope, elm, attr, ngModel) {

        }
    };
}]);
