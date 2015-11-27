angular.module('documents-operation-single', ['ui.router'])

    .controller( 'DocumentOperationModalCtrl', ['$scope', '$rootScope', 'Upload', 'wcmConfig', 'DocumentResource', 'DocumentsResource', '$q', '$window', '$stateParams', '$modalInstance', '$state', '$modal', '$filter', 'WorkflowResource', 'doc', 'operation',
        function($scope, $rootScope, Upload, wcmConfig, DocumentResource, DocumentsResource, $q, $window, $stateParams, $modalInstance, $state, $modal,  $filter,  WorkflowResource, doc, operation) {

            
            $scope.operation = operation;
            $scope.doc = doc;
            $scope.uploadedFiles = [];
      		$scope.rejectedFiles = [];
      		$rootScope.files = [];

			$scope.selected = {};
			$scope.dataOptions = [];

			$scope.duplicateForm = function() {

				DocumentResource.configurationDuplicate({type: doc.type, id: doc.id}, function (response) {

					var form = response[$filter('filter')(_.allKeys(response), 'form', false)[0]];
					if (angular.isDefined(form)) {
						$scope.selected.template = form;
						$scope.formData = {};
						$scope.formData['selected'] = form;
						$scope.formData['selected'].buttonIsDisabled = true;

						$scope.formData['selected']['name'] = doc.name;

						//$scope.dynamicForm.seangu
					}

				}, function(error) {
					$rootScope.$MessageService.writeException(error);
				});
			};

            if(operation === 'delete') {
            	if(doc.operations.can_delete == true) {
            		$scope.doc.operationEnabled = true;
            	}
            } else if(operation === 'powerpromote') {
            	if(doc.operations.can_powerpromote == true) {
            		$scope.doc.operationEnabled = true;
            	}
            } else if(operation === 'unlock') {
            	if(doc.operations.can_unlock == true) {
            		$scope.doc.operationEnabled = true;
            	}
            } else if(operation === 'addlang') {
            	if(doc.operations.can_addlang == true) {
            		$scope.doc.operationEnabled = true;            		
            	}
            } else if(operation === 'new_version') {
            	if(doc.operations.can_upload == true) {
            		$scope.doc.operationEnabled = true;      
            		$rootScope.$UploadService.initNewVersionUpload($scope, false);
            	}
            } else if(operation === 'expire') {
            	if(doc.operations.can_expire == true) {
            		$scope.doc.operationEnabled = true;            		
            	}
            } else if(operation === 'rtf') {
            	if(doc.operations.can_rtf == true) {
            		$scope.doc.operationEnabled = true;
            	}
            } else if(operation === 'duplicate') {

				$scope.duplicateForm();

            	if(doc.type == 'cms_application') {
            		$scope.nameRequired = true;
            		$scope.doc.operationEnabled = true;            		
            	}
				else if(doc.type == 'cms_rule') {

				} else {
            		$scope.doc.operationEnabled = true;
            	}
            } else if(operation === 'workflow') {
            	if(doc.operations.can_workflow == true) {
            		 $scope.doc.operationEnabled = true;
            		 $scope.workflow = {
                             name: "",
                             priority: "5",
                             note: "",
                             notePersistent: true,
                             documents: _.pluck([doc], 'id'),
                             documentObjects : [doc]
                     };
            	}
            } else if (operation === 'remove_from_workflow') {
				$scope.doc.operationEnabled = true;
			} else if (operation === 'deleteprotocol') {
				if($scope.doc.is_rule == 1) {
					$scope.doc.operationEnabled = true;
				}
			} else if(operation === 'version_delete') {
				if(doc.operations.can_deleteversion == true) {
					$scope.doc.operationEnabled = true;
				}
			}
            
            // CREATE RULE PROTOCOL
            $scope.deleteprotocolOK = function () {
            	$rootScope.$DocumentOperationService.deleteRuleProtocol(doc.id);
            	$scope.cancel();
            };
            
            // WORKFLOW

            $scope.workflowOK = function () {
            	if ($scope.form.$valid) {

					$scope.workflow.documents = angular.copy(_.map($scope.workflow.documentObjects, _.iteratee('id')));
                    $rootScope.$DocumentOperationService.createWorkflow(_.omit($scope.workflow, 'documentObjects'));
                	$scope.cancel();                }
            };

			$scope.baseModal = function (listItems) {//(size, name, codetable, multi, form, label) {

				var modalInstance = $modal.open({
					animation: true,
					controller: 'BaseSelectCtrl',
					templateUrl: 'documents/baseModal.tpl.html', //'documents/base-select.tpl.html',
					scope: $scope,
					size: 'lg'
					,
					resolve: {
						origSelected: function () {
							return null; //$scope.formData[form][name];
						},
						label: function () {
							return $filter('translate')("modal.document.title.add_to_workflow.single");
						}
						,
						type: function () {
							return "";
						},
						files_api: function () {
							return undefined;
						},
						only_can_workflow: function() {
							return true;
						},
						search_api: function () {
							return undefined
						},
						rootfolder_api: function () {
							return undefined
						},
						folder_select: function () {
							return false
						},
						multi_select: function () {
							return false
						}

					}
				});

				modalInstance.result.then(function (selectedItem) {

					var protocolId = undefined;
					$rootScope.$DocumentOperationService.ruleProtocol(listItems[0].id).then(function (result) {

						protocolId = result.id;

						angular.forEach(selectedItem, function(value, key) {

							if (value.operations.can_addtowf) {
								if (value.is_rule == 1) {
									var attached = false;


									//if($rootScope.$InboxDetailService.hasRule() && $rootScope.$InboxDetailService.protocolId) {
									if (value.is_rule === 1) {
										if (angular.isDefined(protocolId)) {
											$rootScope.$DocumentOperationService.addToProtocol(value.id, protocolId);
											attached = true;
										}
									}

									if (attached == false) {
										var title = $filter('translate')('message.document.rule.protocol.title');
										var message = $filter('translate')('message.document.rule.protocol.noprotocol');
										$rootScope.$MessageService.writeWarning(title, message, undefined, undefined);
									}
									else {
										listItems.push(value);
									}
									//});

								} else {
									listItems.push(value);
								}
							}
							else {
								var title = $filter('translate')('modal.document.message.workflow.disallow');
								var message = $filter('translate')('modal.document.message.workflow.disallow');
								$rootScope.$MessageService.writeWarning(title, message, undefined, undefined);
							}
						});
					});

				}, function () {
				});
			};

            
            // DUPLICATE
            
            $scope.duplicateOK = function() {

				if (angular.isDefined($scope.dynamicForm)) {

					if ($scope.dynamicForm.$valid) {
						var newPost = $rootScope.transformResponse('selected', 'template');
						$rootScope.$DocumentOperationService.duplicate(doc, newPost);
						$scope.cancel();
					} else {
						$scope.navigateToError();
					}

            	// if($scope.nameRequired) {

					//if ($scope.dynamicForm.$valid) {
					//	//$scope.validateUniqueObjectName($scope.dynamicForm.name, doc.id);
                    //
					//	if ($scope.dynamicForm.name.$viewValue != "") { // && angular.isDefined(docId)) {
					//		DocumentsResource.validateUniqueObjectName({
					//				url: "validators/uniqueobjectname", //attrs.uniqueObjectName,
					//				name: $scope.dynamicForm.name.$viewValue,
					//				id: doc.id
					//			},
					//			function (response) {
                    //
					//				$scope.dynamicForm.name.$setValidity('uniqueObjectName', response.result);
                    //
                    //
					//				if ($scope.dynamicForm.$valid) {
					//					var newPost = $rootScope.transformResponse('selected', 'template');
					//					$rootScope.$DocumentOperationService.duplicate(doc, newPost);
					//					$scope.cancel();
					//				} else {
					//					$scope.navigateToError();
					//				}
                    //
					//			}, function (error) {
					//				$rootScope.$MessageService.writeException(error);
					//			});
                    //
					//	}

				}
				else {
					 $rootScope.$DocumentOperationService.duplicate(doc);
					 $scope.cancel();
				 }
            }



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
            
            // POWER PROMOTE 
            
            $scope.powerpromoteOK = function() {
            	$rootScope.$DocumentOperationService.powerpromote(doc);
            	$scope.cancel();
            }
            
            // UNLOCK DOCUMENT
            
            $scope.unlockOK = function () {
            	$rootScope.$DocumentOperationService.unlock(doc);
            	$scope.cancel();
            };
            
            // EXPIRE DOCUMENT
            
            $scope.expireOK = function () {
            	$rootScope.$DocumentOperationService.expire(doc);
            	$scope.cancel();
            };
            
            // ADD LANG VERSION
            
            $scope.addlangOK = function () {
            	$rootScope.$DocumentOperationService.addLanguageVersion(doc, $scope.doc.new_lang_version.value);
            	$scope.cancel();
            };

            // DELETE DOCUMENT
            
            $scope.deleteOK = function () {
            	$rootScope.$DocumentOperationService.deleteDocument(doc);
            	$scope.cancel();
            };

			// EXPORT DOCUMENT

			$scope.rtfOK = function () {
				DocumentResource.rtfExportDocument({"id" : doc.id});

				$scope.cancel();
			};

            
			// REMOCE DOCUMENT FROM WORKFLOW
			$scope.remove_from_workflowOK = function () {
				$rootScope.$InboxOperationService.removeAttachment({"attachmentIds": [doc.id]});
				$scope.cancel();
			};

            // NEW VERSION
            
            $scope.new_versionOK = function () {
            	if(!$rootScope.$UploadService.checkNotEmptyUpload()) {
            		return;
            	}
            	var post = $rootScope.$UploadService.getNewVersionPost();
            	if(post.length) {
            		$rootScope.$DocumentOperationService.newVersion(post);
            		$scope.cancel();            		
            	}
            };
            
            $scope.isMatched = function(item) {
            	if(item && item.name) {
            		var temp = _.findWhere($rootScope.$UploadService.uploadedFiles, {name: item.name});
            		return angular.isDefined(temp);
            	}
            	return false;
            }
            
            $scope.cancel = function () {
            	$rootScope.$UploadService.clearUpload();
                $modalInstance.dismiss('cancel');
            };

        }]);
