angular.module('inbox', ['ui.router'])

    .controller( 'InboxCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'DocumentsResource', 'DocumentsResource', '$modal', '$filter',
                               function($scope, $rootScope, $state, $stateParams, DocumentsResource, DocumentResource, $modal, $filter) {

    	$rootScope.updateInboxCount();
    	$rootScope.$InboxService.init();

        
        $scope.taskOperationModal = function (item, operation) {
        	if(operation == 'acquire') {
        		$rootScope.$InboxOperationService.acquire(item);
        	} else {
        		var modalInstance = $modal.open({
        			animation: false,
        			templateUrl: 'inbox/taskOperationModal.tpl.html',
        			controller: 'TaskCtrl',
        			size: 'md',
        			resolve: {
        				task: function () {
        					return item;
        				},
        				operation: function () {
        					return operation;
        				}
        			}
        		});        		
        	}
        };

	   $scope.baseModal = function (item) {//(size, name, codetable, multi, form, label) {
		   
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
			   //console.log(selectedItem);
			   if(selectedItem[0].is_rule == 1) {
				   var protocolId = undefined;
				   var attached = false;
				   $rootScope.$DocumentOperationService.ruleProtocol(selectedItem[0].id).then(function(result) {
					   if(result.id) {
						   protocolId = result.id;
					   }
					   if($rootScope.$InboxDetailService.hasRule() && $rootScope.$InboxDetailService.protocolId) {
						   if(angular.isUndefined(protocolId)) {
							   $rootScope.$DocumentOperationService.attachRuleProtocol(item, selectedItem[0], $rootScope.$InboxDetailService.protocolId);
							   attached = true;
						   }
					   } else if(angular.isDefined(protocolId)) {
						   attached = true;
						   $rootScope.$InboxOperationService.addAttachment(item, {"attachmentIds": [selectedItem[0].id]});
					   }
					   
					   if(attached == false) {
						   var title = $filter('translate')('message.document.rule.protocol.title');
						   var message = $filter('translate')('message.document.rule.protocol.noprotocol');
						   $rootScope.$MessageService.writeWarning(title, message, undefined, undefined);
					   }
				   });
				   
			   } else {
				   $rootScope.$InboxOperationService.addAttachment(item, {"attachmentIds": [selectedItem[0].id]});
			   }
		   }, function () {
		   });
	   };
        
    }])
    
.controller( 'TaskCtrl', ['$scope', '$rootScope', '$state', '$filter', '$stateParams', 'DocumentsResource', 'WorkflowResource', 'task', 'operation', '$modalInstance',
                               function($scope, $rootScope, $state, $filter, $stateParams, DocumentsResource, WorkflowResource, task, operation, $modalInstance) {
    	 $scope.activeTask = task;
    	 $scope.operation = operation;
    	 $scope.useNote = (operation == 'addNote' || operation == 'reject' || operation == 'delegate');
    	 
    	 $scope.modalTitle = $filter('translate')('modal.inbox.title.' + operation );
    	 $scope.modalMessage = $filter('translate')('modal.inbox.message.' + operation);
    	 
    	 if(operation == 'delegate') {
    		 $scope.delegateRoles = [];
    		 WorkflowResource.getDelegateRoles({},
				function(response) {
		    		if(angular.isDefined(response.values)) {
		    			var keys = _.keys(response.values);
		             	for(var index = 0; index < keys.length; index++) {
		             		var key = keys[index];
		             		$scope.delegateRoles.push({value : response.values[key], title: key});
		             	}
		             	$scope.redaction = $scope.delegateRoles[0];
		             }	
				}, function(error) {
					$rootScope.$MessageService.writeException(error);
			});
    	 }
    	 
    	 $scope.addNote = function () {
    		 $rootScope.$InboxOperationService.addNote(task, $scope.note);
        	 $modalInstance.dismiss('cancel');
         };
         
         $scope.finish = function () {
        	 $rootScope.$InboxOperationService.finish(task);
        	 $modalInstance.dismiss('cancel');
         };

	   $scope.finish_back = function () {
		   $rootScope.$InboxOperationService.finish_back(task);
		   $modalInstance.dismiss('cancel');
	   };
         
         $scope.decline = function () {

			 if (angular.isDefined($scope.note) && $scope.note !== "") {
				 $rootScope.$InboxOperationService.addNote(task, $scope.note).then(function() {

					 $rootScope.$InboxOperationService.reject(task);
					 $modalInstance.dismiss('cancel');
				 });
			 }
			 else {
				 $rootScope.$InboxOperationService.reject(task);
				 $modalInstance.dismiss('cancel');
			 }

         };
         
         $scope.delegate = function () {
        	 $rootScope.$InboxOperationService.delegate(task, $scope.redaction, $scope.note);
        	 $modalInstance.dismiss('cancel');
         };
         
         $scope.abort = function () {
        	 $rootScope.$InboxOperationService.abort(task);
        	 $modalInstance.dismiss('cancel');
         };
         
         $scope.reset = function () {
        	 $rootScope.$InboxOperationService.reset(task);
        	 $modalInstance.dismiss('cancel');
         };
         
//         $scope.acquire = function () {
//    		 DocumentsResource.workflowOperation({ workflowId: task.item_id, operation: 'acquire' },
//    				 {},
//    				 function(response) {
//    					 $state.go($state.current, {taskId: task.item_id}, {reload: true});
//    					 $modalInstance.dismiss('cancel');
//    					 $rootScope.updateInboxCount();
//    				 }, function(err) {
//    					 console.log(err);
//    					 $modalInstance.dismiss('cancel');
//    				 });
//         };
         
         $scope.resume = function () {
        	 $rootScope.$InboxOperationService.resume(task);
        	 $modalInstance.dismiss('cancel');
         };

         $scope.cancel = function () {
             $modalInstance.dismiss('cancel');
         };
         
}]);
