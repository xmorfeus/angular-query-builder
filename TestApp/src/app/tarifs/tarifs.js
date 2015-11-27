angular.module('tarifs', ['ui.router'])
  	.controller( 'TarifsCtrl', ['$scope', '$rootScope', '$modal', '$sce', '$timeout', '$state', function($scope, $rootScope, $modal, $sce, $timeout, $state) {

			$rootScope.$CodetableListService.init('loc');

			
			$scope.formTemplate = undefined;
			$scope.dataOptions = [];
			$scope.formData = {};
	  		$scope.originalData = [];
	        
	      $scope.select = function(codetable, id) {
	    	 if(angular.isUndefined(id)) {
	    		 return;
	    	 }
	    	 
			 if($scope.isSelected(codetable, id) == true) {
				 $rootScope.id = undefined;
				 $scope.formData = {};
			 } else {
				if(codetable != $scope.codetable) {
					$scope.formTemplate = undefined;
		  			$scope.dataOptions = [];
				}
				$scope.formData = {};
				$scope.loadForm(codetable, id, codetable != $scope.codetable);
				$scope.codetable = codetable;
				 $rootScope.id = id;
			 }
		 };
		 
		 $scope.loadPreview = function(codetable) {
			 if($scope.tarif != codetable) {
				 $scope.tarif = codetable;				 
				 $rootScope.$CodetableDetailService.tarifPreview(codetable).then(function(result) {
					   $scope.documentOverview = $sce.trustAsResourceUrl('data:text/html;charset=utf-8,' + encodeURIComponent(result.document));
					 $timeout(function () {
						 var iframe = document.getElementById("overviewIframe");
						 var iWindow = iframe.contentWindow;
						 var doc = iframe.contentDocument || iframe.contentWindow.document;
						 var height = iWindow.document.body.scrollHeight;
						 $("#overviewIframe").css('height', height + 5 + 'px');
					 }, 1000);
				 }, function(error) {});
			 } else {
				 delete $scope.tarif;
			 }
			 
		 };

		$scope.openOverview = function(codetable) {
			if(angular.isDefined(codetable)) {
				$rootScope.$CodetableDetailService.tarifPreview(codetable).then(function(result) {
					$scope.documentOverview = $sce.trustAsResourceUrl('data:text/html;charset=utf-8,' + encodeURIComponent(result.document));
					var url = $state.href('overview', {codetable: codetable});
					window.open(url,'_blank');
				}, function(error) {});

			}
		}
		 
		$scope.isSelected = function(codetable, id) {
			return ($scope.codetable == codetable && $rootScope.id == id);
		 };
			
		$scope.save = function() {
			var data = $rootScope.transformResponse('formData', 'formTemplate');

			var keys = _.keys(data);

			var editedItems = {};
			for(var index = 0; index < keys.length; index++) {
				var key = keys[index];
				if(data[key] != $scope.originalData[key]) {
					editedItems[key] = data[key];
				}
			}
			$rootScope.$CodetableListService.codetableEdit($scope.codetable, $rootScope.id, editedItems);
        };
			
		$scope.loadForm = function(codetable, id, reload) {
			if(reload == true) {
				$rootScope.$CodetableDetailService.getCodebookForm(codetable, id).then(function(result) {
					$scope.formTemplate = result;
					$rootScope.$CodetableDetailService.getCodebookData(codetable, id).then(function(result) {
						$scope.formData['formData'] = result;
						$scope.originalData = angular.copy(result);
					}, function(error) {});
				}, function(error) { });
			} else {
				$rootScope.$CodetableDetailService.getCodebookData(codetable, id).then(function(result) {
				$scope.formData['formData'] = result;
				$scope.originalData = angular.copy(result);
			}, function(error) {});
			}
		};
         
         $scope.openCodebookOperationModal = function (item, operation, codetable) {
             var modalInstance = $modal.open({
                 animation: false,
                 templateUrl: 'codebook/codebookModal.tpl.html',
                 controller: 'CodebooksModalCtrl',
                 size: 'md',
                 resolve: {
                	 codetable: function() {
                		 return codetable;
                	 },
                     item: function () {
                     	return item;
                     },
                     operation: function () {
                         return operation;
                     }
                 }
             });
             
             modalInstance.opened.then(function() {
             });
         };
         
      // DYNAMIC FORM METHODS /////////////////
         
         $scope.onSelected = function(node, selected, $parentNode) {
             node.parent = $parentNode;
             if (selected) {
                 $scope.selectedNode = [node];
             }
             else {
                 $scope.origSelectedNodes = [];
             }
         };
         
     ///////////////////////////////////
    }])


	.controller( 'OverviewCtrl', ['$scope', '$rootScope', '$modal', '$sce', '$timeout', '$stateParams', function($scope, $rootScope, $modal, $sce, $timeout, $stateParams) {

		var codetable = $stateParams.codetable;
		$rootScope.$CodetableDetailService.tarifPreview(codetable).then(function(result) {

			$scope.documentOverview = $sce.trustAsResourceUrl('data:text/html;charset=utf-8,' + encodeURIComponent(result.document));

			$timeout(function () {
				var iframe = document.getElementById("overviewIframe");
				var iWindow = iframe.contentWindow;
				var doc = iframe.contentDocument || iframe.contentWindow.document;
				var height = iWindow.document.body.scrollHeight;
				$("#overviewIframe").css('height', height + 5 + 'px');
			}, 1000);

		}, function(error) {});
	}])
	
	
	
	.controller( 'TarifImportCtrl', ['$scope', '$rootScope', '$filter', 'Upload', 'wcmConfig', 'CodeTablesResource', 'DocumentResource', '$modal', 'utilityService', '$state', '$stateParams',
  	                            function($scope, $rootScope, $filter, Upload, wcmConfig, CodeTablesResource, DocumentResource, $modal, utilityService, $state, $stateParams) {
  		

  		$rootScope.$UploadService.initTarifUpload($scope);
  		
  		$scope.showList = true;
  		$scope.selected = {};
  		$scope.dataOptions = [];
  		$scope.formData = [];
  		
  		// DYNAMIC FORM METHODS /////////////////

		$scope.onSelected = function (selected) {
			$rootScope.backDocument = $scope.actualDocument;
			$state.go('tarifimport', {
				portal: _.pluck(selected, 'value').join()
			}, {reload: true});


		};

        $scope.remove = function(node, name) {
            var index = $scope.formData['selected'][name].indexOf(node);
            $scope.formData['selected'][name].splice(index, 1);
            $scope.formData['selected'][name] = angular.copy($scope.formData['selected'][name]);
        };
        
    ///////////////////////////////////

    $scope.selectFile = function(file) {
    	if(angular.isDefined($rootScope.$UploadService.selectedFile)) {
    		for(var i = 0; i < $rootScope.$UploadService.uploadedFiles.length; i++) {
    			if($rootScope.$UploadService.uploadedFiles[i].info.id === $rootScope.$UploadService.selectedFile.info.id) {
    				$rootScope.$UploadService.uploadedFiles[i].info.title = $scope.formData['selected'].title;
  					//$rootScope.$UploadService.uploadedFiles[i].info.name = $scope.formData['selected'].name;
    			}  			  
    		}		  
    	} else  {
    		$scope.formData['selected'].title = file.info.title;
    		$scope.formData['selected'].name = file.info.title;
    	}
  		  
    	$scope.formData['selected'].title = file.info.title;
    	$scope.formData['selected'].name = file.info.title;
    	$rootScope.$UploadService.selectedFile = file;
    };
	    
    $scope.$watch('formData["selected"].title', function() {
    	if(angular.isDefined($rootScope.$UploadService.selectedFile)) {
    		for(var i = 0; i < $rootScope.$UploadService.uploadedFiles.length; i++) {
    			if($rootScope.$UploadService.uploadedFiles[i].info.id === $rootScope.$UploadService.selectedFile.info.id) {
    				$rootScope.$UploadService.uploadedFiles[i].info.title = $scope.formData['selected'].title;  				  	    			
    			}  			  
    		}
    	}
    });
	    
	    $scope.$watch('formData["selected"].name', function() {
	    	if(angular.isDefined($rootScope.$UploadService.selectedFile)) {
	    		for(var i = 0; i < $rootScope.$UploadService.uploadedFiles.length; i++) {
	    			if($rootScope.$UploadService.uploadedFiles[i].info.id === $rootScope.$UploadService.selectedFile.info.id) {
	    				$rootScope.$UploadService.uploadedFiles[i].info.name = $scope.formData['selected'].name;
	    			}  			  
	    		}
	    	}
	    });
	    
        $scope.save = function () {
        	if ($scope.dynamicForm.$valid) {
        		if(!$rootScope.$UploadService.checkNotEmptyUpload()) {
        			return;
        		}
        		
        		var postArray = [];
        		var newPost = $rootScope.transformResponse('selected', 'template');
        		for(var i = 0; i < $rootScope.$UploadService.uploadedFiles.length; i++) {
        			$scope.tempFile = $rootScope.$UploadService.uploadedFiles[i];
        			$scope.tempFile.temp = angular.copy(newPost);
        			//$scope.savedfile.temp.title = $scope.savedfile.name;
        			$scope.tempFile.temp.contentID = $scope.tempFile.info.id;
        			$scope.tempFile.temp.type = "cms_loc_product"; //$scope.tempFile.info.type;
        			if($scope.tempFile.info.title === undefined || $scope.tempFile.info.title === '') {
        				$scope.tempFile.temp.title = $scope.tempFile.name;
        			} else {
        				$scope.tempFile.temp.title = $scope.tempFile.info.title;
        			}
        			//if($scope.tempFile.info.name === undefined || $scope.tempFile.info.name === '') {
        			//	$scope.tempFile.temp.name = $scope.tempFile.name;
        			//} else {
        			//	$scope.tempFile.temp.name = $scope.tempFile.info.name;
        			//}
        			if(angular.isDefined($scope.tempFile.modifiedName)) {
        				$scope.tempFile.temp.name = $scope.tempFile.modifiedName;             				
        			} else {
        				$scope.tempFile.temp.name = $scope.tempFile.name;             				
        			}
        			postArray.push(angular.copy($scope.tempFile.temp));
        		}
        		
        		if($rootScope.$UploadService.uploadedFiles.length == postArray.length) {
        			$rootScope.$UploadService.postUploadMetadata(postArray);
        		}
        	}
			else {
				$('#dynamicFormAttachement').addClass('submitted');
				if ($rootScope.errorMessage && $rootScope.errorMessage !== "") {
					var title = $filter('translate')("message.validation.title");
					$rootScope.$MessageService.writeValidationError(title, $rootScope.errorMessage, undefined, undefined);
				}
				
				var firstInvalid = $(document).find('.ng-invalid');

				// if we find one, set focus
				if (firstInvalid && firstInvalid[1]) {
					if ($(firstInvalid[1]).is("div")) {
						$("html, body").scrollTop($(firstInvalid[1]).offset().top-200);
					} else {
						// $('html,body').unbind().animate({scrollTop: $(firstInvalid[1]).offset().top-200},'fast');
						$("html, body").scrollTop($(firstInvalid[1]).offset().top-200);
						firstInvalid[1].focus();
					}
				}
			}
        };

		$scope.cancel = function(actiontype) {
			$scope.goBackFromNewDocument();
		};
	    
        $scope.loadTemplate = function() {

			var portal =  'CS_IA,CS_IE';
			//var portal =  ''; //'CS_IA,CS_IE';

			if ($stateParams.portal) {
				portal = $stateParams.portal;

				var responseDocument = $rootScope.backDocument;
			}


			CodeTablesResource.tarifForm({portal: portal},
				function(response) {
					$scope.selected.template = response[$filter('filter')(_.allKeys(response), 'form', false)[0]];


					if (angular.isDefined($rootScope.tempFormData)) {

						if (angular.isUndefined($scope.formData)) {
							$scope.formData = {};
						}
						$scope.formData['selected'] = $rootScope.tempFormData;
						delete $rootScope.tempFormData;
					}
					else {
						$scope.formData['selected'] = {};
					}


					$scope.formData['selected'].buttonIsDisabled = true;
					$scope.imageForm = [];

					$scope.actualDocument = response[$filter('filter')(_.allKeys(response), 'form', false)[0]];

				}, function(error) {
					$rootScope.$MessageService.writeException(error);
				});
        };
        
        $scope.loadTemplate();
    }]);
	;

  