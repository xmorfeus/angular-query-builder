angular.module('import', ['ui.router'])
  	.controller( 'ImportCtrl', ['$scope', '$rootScope', '$filter', 'Upload', 'wcmConfig', 'ImportResource', 'DocumentResource', '$modal', 'utilityService', '$state', '$stateParams', '$location',
  	                            function($scope, $rootScope, $filter, Upload, wcmConfig, ImportResource, DocumentResource, $modal, utilityService, $state, $stateParams, $location) {
  		

  		
  		$scope.showList = true;
  		$scope.selected = {};
  		$scope.dataOptions = [];
  		$scope.formData = [];
  		
        if(angular.isDefined($rootScope.reloadTemplate)) {
        	delete $rootScope.reloadTemplate;
        } else {
        	$rootScope.$UploadService.initFullUpload($scope);  			
        }


        // DYNAMIC FORM METHODS /////////////////


		$scope.onSelected = function (selected) {


			if (angular.isDefined(selected) && selected.length > 0) {
				$rootScope.backDocument = $scope.actualDocument;
				$rootScope.tempFormData = $rootScope.transformResponse('selected', 'template');

				$state.go('import', {

					portal: _.pluck(selected, 'value').join()
				}, {reload: true});
			}

		};

		///////////////////////////////////

    $scope.selectFile = function(file) {

		$rootScope.$UploadService.selectedFile = file;

		$scope.formData['selected'].title = file.info.title;
		$scope.formData['selected'].abstract_ = file.info.abstract_;

    	if(angular.isDefined($rootScope.$UploadService.selectedFile)) {
    		for(var i = 0; i < $rootScope.$UploadService.uploadedFiles.length; i++) {
    			if($rootScope.$UploadService.uploadedFiles[i].info.id === $rootScope.$UploadService.selectedFile.info.id) {
    				$rootScope.$UploadService.uploadedFiles[i].info.title = $scope.formData['selected'].title;
  					$rootScope.$UploadService.uploadedFiles[i].info.abstract_ = $scope.formData['selected'].abstract_;


    			}  			  
    		}		  
    	}


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
	    
	    $scope.$watch('formData["selected"].abstract_', function() {
	    	if(angular.isDefined($rootScope.$UploadService.selectedFile)) {
	    		for(var i = 0; i < $rootScope.$UploadService.uploadedFiles.length; i++) {
	    			if($rootScope.$UploadService.uploadedFiles[i].info.id === $rootScope.$UploadService.selectedFile.info.id) {
	    				$rootScope.$UploadService.uploadedFiles[i].info.abstract_ = $scope.formData['selected'].abstract_;  				  
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
        			$scope.tempFile.temp.type = $scope.tempFile.info.type;
        			if($scope.tempFile.info.title === undefined || $scope.tempFile.info.title === '') {
        				$scope.tempFile.temp.title = $scope.tempFile.name;
        			} else {
        				$scope.tempFile.temp.title = $scope.tempFile.info.title;
        			}
        			if($scope.tempFile.info.abstract_ === undefined || $scope.tempFile.info.abstract_ === '') {
        				$scope.tempFile.temp.abstract_ = $scope.tempFile.name;
        			} else {
        				$scope.tempFile.temp.abstract_ = $scope.tempFile.info.abstract_;
        			}
        			if(angular.isDefined($scope.tempFile.modifiedName)) {
        				$scope.tempFile.temp.name = $filter('withoutInterpunction')($scope.tempFile.modifiedName);             				
        			} else {
        				$scope.tempFile.temp.name = $filter('withoutInterpunction')($scope.tempFile.name);             				
        			}
        			postArray.push(angular.copy($scope.tempFile.temp));
        		}
        		
        		if($rootScope.$UploadService.uploadedFiles.length == postArray.length) {
        			$rootScope.$UploadService.postUploadMetadata(postArray);
        		}

				$('#dynamicFormAttachement').removeClass('submitted');
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

			var portal =  ''; //'CS_IA,CS_IE';

			if ($stateParams.portal) {
				portal = $stateParams.portal;

				var responseDocument = $rootScope.backDocument;
			}


        	ImportResource.attachementForm({portal: portal},
        	function(response) {
        		$scope.selected.template = response[$filter('filter')(_.allKeys(response), 'form', false)[0]];//response.form_SC_CS_IA;


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
        		$scope.imageForm = []; //angular.copy($scope.imageTemplate);

				$scope.actualDocument = response[$filter('filter')(_.allKeys(response), 'form', false)[0]];

        	}, function(error) {
        		$rootScope.$MessageService.writeException(error);
        	});
        	
        };
        
        $scope.loadTemplate();
    }])
    
    .controller( 'BaseUploadEditorCtrl', ['$scope', '$rootScope', '$stateParams', '$filter', '$modal', 'DocumentsResource', 'ImportResource',
                                 function($scope, $rootScope, $stateParams, $filter, $modal, DocumentsResource, ImportResource) {


    	$rootScope.$UploadService.initBaseUpload($scope);

  		$scope.showList = true;
  		$scope.selected = {};
  		$scope.dataOptions = [];
  		$scope.formData = [];
  		$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];
  		
  		// DYNAMIC FORM METHODS /////////////////


		$scope.onSelected = function (selected) {


			if (angular.isDefined(selected) && selected.length > 0) {
				$rootScope.backDocument = $scope.actualDocument;

				$state.go('import', {

					portal: _.pluck(selected, 'value').join()
				}, {reload: true});

			}
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
  					$rootScope.$UploadService.uploadedFiles[i].info.abstract_ = $scope.formData['selected'].abstract_;  				  
    			}  			  
    		}		  
    	} else  {
    		$scope.formData['selected'].title = file.info.title;
    		$scope.formData['selected'].abstract_ = file.info.abstract_;
    	}
  		  
    	$scope.formData['selected'].title = file.info.title;
    	$scope.formData['selected'].abstract_ = file.info.abstract_;
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
	    
	    $scope.$watch('formData["selected"].abstract_', function() {
	    	if(angular.isDefined($rootScope.$UploadService.selectedFile)) {
	    		for(var i = 0; i < $rootScope.$UploadService.uploadedFiles.length; i++) {
	    			if($rootScope.$UploadService.uploadedFiles[i].info.id === $rootScope.$UploadService.selectedFile.info.id) {
	    				$rootScope.$UploadService.uploadedFiles[i].info.abstract_ = $scope.formData['selected'].abstract_;  				  
	    			}  			  
	    		}
	    	}
	    });
	    
        $scope.save = function () {
        	if ($scope.dynamicForm.$valid) {
        		if(!$rootScope.$UploadService.checkNotEmptyUpload()) {
        			return;
        		}

				var nameArray = [];
        		var postArray = [];
        		var newPost = $rootScope.transformResponse('selected', 'template');
        		for(var i = 0; i < $rootScope.$UploadService.uploadedFiles.length; i++) {
        			$scope.tempFile = $rootScope.$UploadService.uploadedFiles[i];
        			$scope.tempFile.temp = angular.copy(newPost);
        			//$scope.savedfile.temp.title = $scope.savedfile.name;
        			$scope.tempFile.temp.contentID = $scope.tempFile.info.id;
        			$scope.tempFile.temp.type = $scope.tempFile.info.type;
        			if($scope.tempFile.info.title === undefined || $scope.tempFile.info.title === '') {
        				$scope.tempFile.temp.title = $scope.tempFile.name;
        			} else {
        				$scope.tempFile.temp.title = $scope.tempFile.info.title;
        			}
        			if($scope.tempFile.info.abstract_ === undefined || $scope.tempFile.info.abstract_ === '') {
        				$scope.tempFile.temp.abstract_ = $scope.tempFile.name;
        			} else {
        				$scope.tempFile.temp.abstract_ = $scope.tempFile.info.abstract_;
        			}
        			if(angular.isDefined($scope.tempFile.modifiedName)) {
        				$scope.tempFile.temp.name = $filter('withoutInterpunction')($scope.tempFile.modifiedName);             				
        			} else {
        				$scope.tempFile.temp.name = $filter('withoutInterpunction')($scope.tempFile.name);             				
        			}
        			$scope.tempFile.temp.docID = $stateParams.id;
        			postArray.push(angular.copy($scope.tempFile.temp));
					nameArray.push(angular.copy($scope.tempFile.temp.name));
        		}


				document.getElementById('selectImage').value = nameArray.join(";");
        		
        		if($rootScope.$UploadService.uploadedFiles.length == postArray.length) {
        			$rootScope.$UploadService.postUploadMetadata(postArray);
        			$scope.formData["selected"] = {};
        		}

				$('#dynamicFormAttachement').removeClass('submitted');
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
	    
        $scope.loadTemplate = function() {

        	ImportResource.baseImageForm({id: $stateParams.id},
        	function(response) {
        		$scope.selected.template = response[$filter('filter')(_.allKeys(response), 'form', false)[0]];//response.form_SC_CS_IA;
        		$scope.formData = {};
        		$scope.formData['selected'] = response[$filter('filter')(_.allKeys(response), 'form', false)[0]];
        		//$scope.formData['selected'].title = '######';
        		$scope.formData['selected'].buttonIsDisabled = true;
        		$scope.imageForm = []; //angular.copy($scope.imageTemplate);
        	}, function(error) {
        		$rootScope.$MessageService.writeException(error);
        	});
        };
        
        $scope.loadTemplate();
}])
    ;
  