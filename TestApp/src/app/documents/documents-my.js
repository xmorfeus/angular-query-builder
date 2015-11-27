angular.module('documents-my', ['ui.router'])

    .controller( 'MyDocumentsCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
    	$rootScope.$ListService.init('my_files');
    }])
    
    .controller( 'RuleAttachmentUploadCtrl', ['$scope', '$rootScope', '$filter', 'Upload', 'wcmConfig', 'ImportResource', 
                                              'DocumentResource', '$modal', 'utilityService', 'operation', 'doc', '$modalInstance',
  	                            function($scope, $rootScope, $filter, Upload, wcmConfig, ImportResource, 
  	                            		DocumentResource, $modal, utilityService, operation, doc, $modalInstance) {
    	
    	$scope.selected = {};
    	$scope.dataOptions = [];

    	$scope.doc = doc;
    	$scope.operation = operation;
    	
    	 $scope.attachattachmentTeplate = function() {
    		 $rootScope.overlayClass = 'ruleloader';
         	ImportResource.ruleAttachmentForm({id : doc.id}, 
         			function(response) {
         		$scope.selected.template = response.form;
         		$scope.formData = {};
         		$scope.formData['selected'] = response.form;
         		$scope.formData['selected'].buttonIsDisabled = true;

         	}, function(error) {
         		$rootScope.$MessageService.writeException(error);
         	});
         };
         
         $scope.majorversionForm = function() {
        	DocumentResource.ruleMajorVersionForm({id : doc.id}, 
          	function(response) {
          		$scope.selected.template = response.form;
          		$scope.formData = {};
          		$scope.formData['selected'] = response.form;
          		$scope.formData['selected'].buttonIsDisabled = true;


				$scope.formData['selected']['title'] = doc.title;
				$scope.formData['selected']['abstract_'] = doc.abstract_;
          	}, function(error) {
          		$rootScope.$MessageService.writeException(error);
          	});
          };
          
          $scope.cancelversionForm = function() {
        	  $rootScope.overlayClass = 'ruleloader';
          	DocumentResource.ruleCancelVersionForm({id : doc.id},
            	function(response) {
            		$scope.selected.template = response.form;
            		$scope.formData = {};
            		$scope.formData['selected'] = response.form;
            		$scope.formData['selected'].buttonIsDisabled = true;
            	}, function(error) {
            		$rootScope.$MessageService.writeException(error);
            	});
            };
         
         
    	
    	if(operation == 'addattachment') {
    		$rootScope.$UploadService.initRuleAttachementUpload($scope); 
    		$scope.attachattachmentTeplate();
    	} else if(operation == 'majorversion') {
    		$scope.majorversionForm();
    	} else if(operation == 'cancelversion') {
    		$scope.cancelversionForm();
    	}
  		
  		
  		// DYNAMIC FORM METHODS /////////////////

        
    ///////////////////////////////////
        
        $scope.attachattachmentOK = function() {
        	if ($scope.dynamicForm.$valid) {
        		if(!$rootScope.$UploadService.checkNotEmptyUpload()) {
        			return;
        		}

				var title = $filter('translate')('message.document.addattachmentbegin.title');
				var message = $filter('translate')('message.document.addattachmentbegin.success');
				$rootScope.$MessageService.writeInfo(title, message, undefined, undefined);

        		var postArray = [];
        		var newPost = $rootScope.transformResponse('selected', 'template');
        		for(var i = 0; i < $rootScope.$UploadService.uploadedFiles.length; i++) {
        			$scope.tempFile = $rootScope.$UploadService.uploadedFiles[i];
        			$scope.tempFile.temp = angular.copy(newPost);
        			//$scope.savedfile.temp.title = $scope.savedfile.name;
        			$scope.tempFile.temp.contentID = $scope.tempFile.info.id;
        			$scope.tempFile.temp.type = $scope.tempFile.info.type;
        			$scope.tempFile.temp.ruleID = $scope.doc.id;
        			if($scope.tempFile.info.title === undefined || $scope.tempFile.info.title === '') {
        				$scope.tempFile.temp.title = $scope.tempFile.name;
        			} else {
        				$scope.tempFile.temp.title = $scope.tempFile.info.title;
        			}
//        			if($scope.tempFile.info.abstract_ === undefined || $scope.tempFile.info.abstract_ === '') {
//        				$scope.tempFile.temp.abstract_ = $scope.tempFile.name;
//        			} else {
//        				$scope.savedfile.temp.abstract_ = $scope.tempFile.info.abstract_;
//        			}
        			$scope.tempFile.temp.name = $scope.tempFile.name;     
        			postArray.push(angular.copy($scope.tempFile.temp));
        		}
        		
        		if($rootScope.$UploadService.uploadedFiles.length == postArray.length) {
        			$rootScope.overlayClass = 'ruleloader';
        			$rootScope.$UploadService.postUploadMetadata(postArray);
        			$scope.cancel();
        		}
        	} else {
        		$scope.navigateToError();
			}
        };
        
        $scope.majorversionOK = function() {
        	if ($scope.dynamicForm.$valid) {
        		$rootScope.overlayClass = 'ruleloader';
        		var newPost = $rootScope.transformResponse('selected', 'template');
        		$rootScope.$DocumentOperationService.newMajorVersion(newPost, doc.id);
        		$scope.cancel();
        	} else {
        		$scope.navigateToError();
			}
        };
        
        $scope.cancelversionOK = function() {
        	if ($scope.dynamicForm.$valid) {
        		$rootScope.overlayClass = 'ruleloader';
        		var newPost = $rootScope.transformResponse('selected', 'template');
        		$rootScope.$DocumentOperationService.newCancelVersion(newPost, doc.id);
        		$scope.cancel();
        	} else {
        		$scope.navigateToError();
			}
        };

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
	    
//	$scope.$watch('formData["selected"].abstract_', function() {
//		if(angular.isDefined($rootScope.$UploadService.selectedFile)) {
//	    		for(var i = 0; i < $rootScope.$UploadService.uploadedFiles.length; i++) {
//	    			if($rootScope.$UploadService.uploadedFiles[i].info.id === $rootScope.$UploadService.selectedFile.info.id) {
//	    				$rootScope.$UploadService.uploadedFiles[i].info.abstract_ = $scope.formData['selected'].abstract_;  				  
//	    			}  			  
//	    		}
//	    	}
//	});
        
        $scope.navigateToError = function() {
        	$('#dynamicFormAttachment').addClass('submitted');
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
        };

		$scope.cancel = function(actiontype) {
			$modalInstance.dismiss('cancel');
			$rootScope.$UploadService.clearUpload();
		};
	    
        
    }])
    ;
