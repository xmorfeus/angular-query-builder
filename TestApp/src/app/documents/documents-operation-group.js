angular.module('documents-operation-group', ['ui.router'])

    .controller( 'GroupOperationModalCtrl', ['$scope', '$rootScope', 'Upload', '$timeout', 'wcmConfig', 'DocumentResource', 'DocumentsResource', '$q', '$window', '$stateParams', '$modalInstance', '$state', '$modal', '$filter', 'WorkflowResource', 'docs', 'operation',
        function($scope, $rootScope, Upload, $timeout, wcmConfig, DocumentResource, DocumentsResource, $q, $window, $stateParams, $modalInstance, $state, $modal,  $filter,  WorkflowResource, docs, operation) {

            
            $scope.operation = operation;
            $scope.allows = [];
            $scope.disallows = [];
            $scope.uploadedFiles = [];
      		$scope.rejectedFiles = [];
      		$rootScope.files = [];
      		$scope.showList = true;
            
            if(operation === 'delete') {
            	for(var index = 0; index < docs.length; index++) {
            		if(docs[index].operations.can_delete == true) {
            			$scope.allows.push(docs[index]);
            		} else {
            			$scope.disallows.push(docs[index]);
            		}
            	}
            } else if(operation === 'workflow') {
            	for(var index = 0; index < docs.length; index++) {
            		if(docs[index].operations.can_workflow == true) {
            			$scope.allows.push(docs[index]);
            		} else {
            			$scope.disallows.push(docs[index]);
            		}
            	}
            	
            	$scope.workflow = {
                        "name": "",
                        "priority": "5",
                        "note": "",
                        "notePersistent": true,
                        "documents":_.pluck($scope.allows, 'id'),
                        "documentObjects" : $scope.allows
                    };
            } else if(operation === 'new_version') {
            	$rootScope.$UploadService.initNewVersionUpload($scope, true);
            	for(var index = 0; index < docs.length; index++) {
            		if(docs[index].operations.can_upload == true) {
            			$scope.allows.push(docs[index]);
            		} else {
            			$scope.disallows.push(docs[index]);
            		}
            	}            	
            } else if(operation === 'powerpromote') {
            	for(var index = 0; index < docs.length; index++) {
            		if(docs[index].operations.can_powerpromote == true) {
            			$scope.allows.push(docs[index]);
            		} else {
            			$scope.disallows.push(docs[index]);
            		}
            	}            	
            } else if(operation === 'expire') {
            	for(var index = 0; index < docs.length; index++) {
            		if(docs[index].operations.can_expire == true) {
            			$scope.allows.push(docs[index]);
            		} else {
            			$scope.disallows.push(docs[index]);
            		}
            	}            	
            } else if(operation === 'export') {
            	for(var index = 0; index < docs.length; index++) {
            		if(docs[index].operations.can_export == true) {
            			$scope.allows.push(docs[index]);
            		} else {
            			$scope.disallows.push(docs[index]);
            		}
            	}            	
            } else if(operation === 'unlock') {
            	for(var index = 0; index < docs.length; index++) {
            		if(docs[index].operations.can_unlock == true) {
            			$scope.allows.push(docs[index]);
            		} else {
            			$scope.disallows.push(docs[index]);
            		}
            	}            	
            } else if(operation === 'addlang') {
            	DocumentsResource.list({
                   	operation: 'langs'
                   	}, 
       	        function(response) {
                   	$scope.langs = response.data;
					var selectLang = $filter('filter')($scope.langs, {object_name: "en_US"});
                    $scope.updateAvailableLangs(angular.isDefined(selectLang[0]) ? selectLang[0] : $scope.langs[0]);
                    
               	});       	
            }

            
            // ADD LANG
            
            $scope.updateAvailableLangs = function(item) {
            	$scope.lang_version = item;
            	$scope.allows = [];
            	$scope.disallows = [];
            	
            	for(var index = 0; index < docs.length; index++) {
            		if(docs[index].langs_available.length) {
            			var temp = _.findWhere(docs[index].langs_available, {value:$scope.lang_version.object_name});
            			if(angular.isDefined(temp)) {
            				$scope.allows.push(docs[index]);            				
            			} else {
            				$scope.disallows.push(docs[index]);
            			}
            		} else {
            			$scope.disallows.push(docs[index]);
            		}
            	}  
            };
            
            $scope.addlangOK = function () {
            	if($scope.allows.length && angular.isDefined($scope.lang_version)) {
            		$rootScope.$DocumentOperationService.addLanguageVersionGroup($scope.allows, $scope.lang_version.object_name, undefined);
            		$scope.cancel();
            	}
            };
            
            // WORKFLOW

            $scope.workflowOK = function () {            	
                if ($scope.form.$valid) {
                	$rootScope.$DocumentOperationService.createWorkflow(_.omit($scope.workflow, 'documentObjects'))
                    $scope.cancel();
                }
            };
            
            // DELETE DOCUMENT

            $scope.deleteOK = function () {
                $rootScope.$DocumentOperationService.deleteGroup($scope.allows, undefined);
            	$scope.cancel();
            };
            
            // EXPORT DOCUMENT

            $scope.exportOK = function () {
            	var index = 0;
            	var success = true;
            	
            	while(index < $scope.allows.length) {
						exportDoc($scope.allows[index]);
						index++;
            	}
            	
            	$scope.cancel();
            };
            
            function exportDoc(item) {
            	$scope.exportFile = item;
            	var url = wcmConfig.backend + 'documents/' + item.id + '/rendition'
            	$('#exportTag').attr('href', url);
            	$('#exportTag').attr('download', item.name);
            	$('#exportTag')[0].click();
            	$('#exportTag').attr('href', '');
            	$('#exportTag').attr('download', '');
            }
            
            // POWER PROMOTE
            
            $scope.powerPromoteOK = function () {
            	$rootScope.$DocumentOperationService.powerpromoteGroup($scope.allows, undefined);
            	$scope.cancel();
            };
            
            // EXPIRE
            
            $scope.expireOK = function () {
            	$rootScope.$DocumentOperationService.expireGroup($scope.allows, undefined);
            	$scope.cancel();
            };
            
            
            // UNLOCK
            
            $scope.unlockOK = function () {
            	$rootScope.$DocumentOperationService.unlockGroup($scope.allows, undefined);
            	$scope.cancel();
            };
            
            // NEW VERSION
            
            $scope.new_versionOK = function () {
            	var post = $rootScope.$UploadService.getNewVersionPost();
            	if(post.length) {
            		$rootScope.$DocumentOperationService.newVersion(post);
            		$scope.cancel();  
            	}
            };
            
            $scope.isMatched = function(item) {
            	if(item && item.name) {
            		var temp = _.findWhere($rootScope.$UploadService.uploadedFiles, {name: item.name});
            		if(angular.isUndefined(temp)) {
            			temp = _.findWhere($rootScope.$UploadService.uploadedFiles, {modifiedName: item.name});
            		}
            		return angular.isDefined(temp);
            	}
            	return false;
            };
      		
            $scope.cancel = function () {
            	$rootScope.$UploadService.clearUpload();
                $modalInstance.dismiss('cancel');
            };


        }]);
       