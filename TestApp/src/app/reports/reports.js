angular.module('reports', ['ui.router'])
  	.controller( 'ReportsCtrl', ['$scope', '$rootScope', 'ContentResource', 'DocumentsResource', '$filter',
        '$translate', '$state', '$stateParams', 'utilityService',
        function($scope, $rootScope, ContentResource, DocumentsResource, $filter, $translate, $state,
                 $stateParams, utilityService) {

        $scope.dataOptions = [];

        $scope.export_header =
        [
            //$filter('translate')("csv.name"),
            //$filter('translate')("csv.title"),
            //$filter('translate')("csv.modify_date"),
            //$filter('translate')("csv.language"),
            //$filter('translate')("csv.owner_name"),
            //$filter('translate')("csv.state"),
            //$filter('translate')("csv.version")
            'Název',
            'Titulek',
            'Datum změny',
            'Jazyk',
            'Vlastník',
            'Stav',
            'Verze'
        ]

        ContentResource.get({
            code: 'wcm_reports'
            }, function(response) {

                $scope.reports = [];

                if (response.values != undefined)
                {
                    $scope.mapToList(response.values, $scope.reports).then(function(newList) {

                        $scope.reports = newList;

                        if ($stateParams.selected) {


                            $scope.reports.selected = $scope.reports[_.findIndex($scope.reports, {id: $stateParams.selected})];

                            ContentResource.getReport({
                                code: $stateParams.selected.split(',')[1],
                                type: $stateParams.selected.split(',')[0]
                            }, function (response) {

                                $scope.formTemplate = response[$filter('filter')(_.allKeys(response), 'form', false)[0]];

                                $scope.formData['formData'] = [];

                            }, function (error) {
                                $scope.formTemplate = [];
                                $scope.formData['formData'] = [];
                                $rootScope.$MessageService.writeException(error);
                            });
                        }

                    });
                }



            }, function (error) {
                $rootScope.$MessageService.writeException(error);
            });


        $scope.loadForm = function (item, model) {

            $state.go('dashboard.reports', {selected: item.id});

        };

        $scope.sendForm = function () {

            var newPost = $rootScope.transformResponse('formData', 'form', undefined, true);

            var isValidDate = function (dateStr) {

                if (dateStr == undefined)
                    return false;
                var dateTime = new Date(dateStr);
                if (isNaN(dateTime)) {
                    return false;
                }
                return true;
            };

            var newPostReport = [];

            $.map(newPost, function(value,key) {

                if (key.indexOf("control_") === -1 ) {

                   var object = utilityService.getObject($rootScope.template["form"], "name", key);


                    
                    newPostReport.push({
                            property: key,
                            operator: (angular.isDefined(object) && angular.isDefined(object.operator)) ? object.operator : "=",
                            value: value
                        }
                    );
                }

            });

            DocumentsResource.reports({
                id: $scope.reports.selected.id.split(',')[0],
                //params: newPostString
                filter: JSON.stringify(newPostReport)
            }, function(response) {

                $scope.documents = _.map(response.data, function(value){
                    return _.pick(value, 'name', 'name', 'title', 'modify_date', 'language', 'owner_name', 'state', 'version');
                });

            }, function (error) {
            	$rootScope.$MessageService.writeException(error);
            });
        };






    }]);

  