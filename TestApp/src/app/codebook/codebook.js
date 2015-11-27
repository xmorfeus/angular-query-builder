angular.module('codebooks', ['ui.router'])
  	.controller( 'CodebooksCtrl', ['$scope', '$rootScope', '$state', '$modal', '$filter', 'utilityService',
  	     function($scope, $rootScope, $state, $modal, $filter, utilityService) {


			 $rootScope.$CodetableListService.init('codetables');

  			
  			$scope.formTemplate = undefined;
  			$scope.dataOptions = [];
  			$scope.formData = {};
  	  		$scope.originalData = [];
  	        
  	      $scope.select = function(codetable, id, data) {
  			 if($scope.isSelected(codetable, id) == true) {
				 $rootScope.id = undefined;
				 $scope.data = undefined;
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
			 	$scope.data = data;
  			 }

			  $state.go('dashboard.codebookDetail', {codetable: $scope.codetable, id: $rootScope.id});
  		 };
  		 
  		$scope.isSelected = function(codetable, id) {
  			return ($scope.codetable == codetable && $rootScope.id == id);
  		 };
  			
  			$scope.save = function() {

            	var data = $rootScope.transformResponse('formData', 'formTemplate');

            	var keys = _.keys(data);
            	if($scope.dynamicForm.$valid) {
            		var editedItems = {};
            		for(var index = 0; index < keys.length; index++) {
            			var key = keys[index];

						$scope.result = utilityService.getObject($rootScope.template['formTemplate'], "element", key);

						if ($scope.result === null) {
							$scope.result = utilityService.getObject($rootScope.template['formTemplate'], "name", key);
						}

						if (angular.isDefined($scope.dynamicForm[key]) && $scope.result.readonly !== "true") {
							editedItems[key] = data[key];
						}
            		}


            		$rootScope.$CodetableListService.codetableEdit($scope.codetable, $rootScope.id, editedItems).then(function(response) {
						$scope.data.text = response.text;
						$scope.data.edited = true;

						$rootScope.id = undefined;
						$scope.data = undefined;
						$scope.formData = {};

					});

            	}
				else {


					$('#dynamicForm').addClass('submitted');

					if (  $rootScope.errorMessage && $rootScope.errorMessage !== "") {
						var title = $filter('translate')("message.validation.title");
						$rootScope.$MessageService.writeValidationError(title, $rootScope.errorMessage, undefined, undefined);
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
            };
  			
  			$scope.loadForm = function(codetable, id, reload) {
  				if(reload == true) {
  					$rootScope.$CodetableDetailService.getCodebookForm(codetable, id).then(function(result) {
  						$scope.formTemplate = result;
  						$scope.isCodeBook = true;
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

				 modalInstance.result.finally(function() {
					 $rootScope.id = undefined;
					 $scope.data = undefined;
					 $scope.formData = {};

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
    
  	.controller( 'CodebooksModalCtrl', ['$scope', '$rootScope', '$state', '$filter', 'codetable', 'operation', 'item', '$modalInstance', 'CodeTablesResource',
  	     function($scope, $rootScope, $state, $filter, codetable, operation, item, $modalInstance, CodeTablesResource) {
  			  		
  			var type = $rootScope.$CodetableListService.type;
  			$scope.operation = operation;
  			$scope.codetable = codetable;
  			$scope.item = item;
  			if(angular.isUndefined(item)) {
  				item = {name: 'Novy'}
  			}
  			if(!item.name) {
  				$scope.item.name = item.text;
  			}
  			$scope.title = $filter('translate')('modal.' + type + '.' + operation + '.title');
  			$scope.message = $filter('translate')('modal.' + type + '.' + operation + '.message');
  			
  			 $scope.showOkMajor = false;

			 if (type === "loc" && (operation === "unyellow" || operation === "commit")) {
				 $rootScope.setLoader(undefined);
				 CodeTablesResource.minormajor({codetable: item.name},
					 function (response) {
						 $scope.showOkMajor = angular.isDefined(response.result) ? response.result == 'true' : false;
					 });
			 }
  		
             $scope.commitOK = function() {
            	 $rootScope.$CodetableListService.checkin(item.name, false);
				 $scope.cancel();
             };
             
             $scope.rollbackOK = function() {
            	 $rootScope.$CodetableListService.cancelCheckout(item.name);
            	 $scope.cancel();
             };
             
             $scope.commitOKmajor = function() {
				 $rootScope.$CodetableListService.checkin(item.name, true);
				 $scope.cancel();
			 };

			 $scope.unyellow = function () {
				 $rootScope.$CodetableListService.unyellow(item.name, true);
				 $scope.cancel();
			 };

             $scope.cancel = function() {

            	 $modalInstance.dismiss('cancel');


            	 //$rootScope.$CodetableListService.cancelCheckout(item.name);
             };
             
             $scope.deleteOK = function() {
            	 $rootScope.$CodetableListService.codetableDelete($scope.codetable, $scope.item.id);
            	 $scope.cancel();
             }
    }])
    
    .controller( 'CodebookFormCtrl', ['$scope', '$rootScope', 'CodeTablesResource', '$stateParams', '$state', '$filter', '$modal', 'utilityService',
        function($scope, $rootScope, CodeTablesResource, $stateParams, $state, $filter, $modal, utilityService) {

    	$scope.dataOptions = [];
  		$scope.formData = [];
    	
    		$scope.isNew = angular.isUndefined($stateParams.id);
            $scope.codetable = $stateParams.codetable;
			$rootScope.id = $stateParams.id;
            if($scope.isNew == true) {
				$rootScope.id = '9999';
            }

			$scope.isCodeBook = true;

            $scope.actualDocument = {};

            $rootScope.setLoader('loader.codetable.detail');
            CodeTablesResource.codetableDetailForm({codetable: $scope.codetable, id: $rootScope.id},
            		function(response) {
               //console.log(response);
                $scope.formTemplate = response[$filter('filter')(_.allKeys(response), 'form', false)[0]];
                $scope.formData['formData'] = []; //responseDocument;
                if($scope.isNew == false) {
                	CodeTablesResource.detail({
                		codetable: $scope.codetable,
                		id: $rootScope.id},
                		function(responseData) {
                			$scope.formData['formData'] = $scope.actualDocument = responseData;
                			$scope.codetableDetailData = angular.copy(responseData);
                		}, function(error) {
                			$rootScope.$MessageService.writeException(error);
                	});                	
                }
            }, function(error) {
            	$rootScope.$MessageService.writeException(error);
            });
            
            $scope.goToCodebooks = function() {
            	if($rootScope.$CodetableListService.type === 'codetables') {
            		$state.go('dashboard.codebooks');            		
            	} else {
            		$state.go('dashboard.tarifs'); 
            	}
            };

            $scope.goToCodebook = function() {
            	if($rootScope.$CodetableListService.type === 'codetables') {
            		$state.go('dashboard.codebook', {name: $scope.codetable});
            	} else {
            		$state.go('dashboard.tarifs', {name: $scope.codetable}); 
            	}
            };
            
            $scope.save = function() {

				var data = $rootScope.transformResponse('formData', 'form');

				var keys = _.keys(data);
				if($scope.dynamicForm.$valid) {
					var editedItems = {};
					for(var index = 0; index < keys.length; index++) {
						var key = keys[index];

						$scope.result = utilityService.getObject($rootScope.template['form'], "element", key);

						if ($scope.result === null) {
							$scope.result = utilityService.getObject($rootScope.template['form'], "name", key);
						}

						if (angular.isDefined($scope.dynamicForm[key]) && $scope.result.readonly !== "true") {
							editedItems[key] = data[key];
						}
					}


					$rootScope.$CodetableListService.codetableEdit($scope.codetable, $rootScope.id, editedItems).then(function(response) {
						//$scope.data.text = response.text;
						//$scope.data.edited = true;
                        //
						//$rootScope.id = undefined;
						//$scope.data = undefined;
						//$scope.formData = {};

					});

				}
				else {


					$('#dynamicForm').addClass('submitted');

					if (  $rootScope.errorMessage && $rootScope.errorMessage !== "") {
						var title = $filter('translate')("message.validation.title");
						$rootScope.$MessageService.writeValidationError(title, $rootScope.errorMessage, undefined, undefined);
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

			$scope.remove = function(node, name) {
				var index = $scope.formData['formData'][name].indexOf(node);
				$scope.formData['formData'][name].splice(index, 1);
				$scope.formData['formData'][name] = angular.copy($scope.formData['formData'][name]);
			};


			///////////////////////////////////

    }])
    
.service('CodetableListService', ['$q', '$rootScope', '$state', '$stateParams', '$cookieStore', '$filter', 'CodeTablesResource', '$modal', '$translate',
        function ($q, $rootScope, $state, $stateParams, $cookieStore, $filter, CodeTablesResource, $modal, $translate) {

	this.treedata = [];
	this.opened = [];
	
	$rootScope.$watch('$CodetableListService.parent', function() {
        $rootScope.$CodetableListService.updateCache();
    });
		
    this.init = function(type) {

		this.treedata = [];
		var rootTitle = "";



		if (angular.isDefined($rootScope.cache[type])) {

		} else {
			$rootScope.cache[type] = {}
		}

		if (angular.isUndefined($rootScope.tree)) {
			$rootScope.tree = {};
		}
		this.type = type;
		$rootScope.tree.opened = false;
		this.codetables = [];
		this.parents = $rootScope.cache[type].parents ? $rootScope.cache[type].parents : [{description: rootTitle}];

		$translate('root.' + type)
		.then(function (translatedValue) {
			rootTitle = translatedValue;

			$rootScope.$CodetableListService.parents[0] = {description: rootTitle};
		});

		this.parent = {};
		this.item = $rootScope.cache[type].item;
		this.codetable = $rootScope.cache[type].codetable ? $rootScope.cache[type].codetable : "";
		this.codetableId = $rootScope.cache[type].codetableId ? $rootScope.cache[type].codetableId : "root";

		this.selectedNode = {};
		this.treeOptions = {
			nodeChildren: "children",
			dirSelectable: true,
			multiSelection: false
		};

		this.loadData();
		//this.loadCodetables();

    };
    
    this.openFolder = function(item) {

    	if (item.leaf) {
    		if(item['new'] == false && item['deleted'] == false) {	
    			$state.go('dashboard.codebookDetail', {codetable: this.codetable, id: item.id});    				
    		}
    	} else {
    		if(angular.isUndefined(item.lock_owner) || (angular.isDefined(item.lock_owner) && (item.lock_owner == null || item.lock_owner == '' || item.lock_owner == $rootScope.user_name))) {
    			this.treedata = [];


    			this.parent = item;
    			this.parents.push(item);
    			this.codetable = item.name ? item.name : this.codetable;
    			this.codetableId = item.id ? item.id : 'root';
    			//this.checkout(this.codetable);


				if((angular.isUndefined(item.lock_owner) || item.lock_owner === null || item.lock_owner == '') && ($rootScope.$CodetableListService.type === 'loc')) {
					$rootScope.$CodetableListService.modalInstance = $modal.open({
						animation: false,
						templateUrl: 'codebook/codebookModal.tpl.html',
						controller: 'CodebooksModalCtrl',
						size: 'md',
						resolve: {
							codetable: function () {
								return this.codetable;
							},
							item: function () {
								return item;
							},
							operation: function () {
								return 'unyellow';
							}
						}
					});
				}

				item.lock_owner = $rootScope.user_name;

				this.loadData();

    		} else {
    			var title = $filter('translate')('message.codetables.locked.title');
				var message = $filter('translate')('message.codetables.locked.msg');
				$rootScope.$MessageService.writeWarning(title, message, undefined, undefined);
    		}
    	}
    };
    
    this.openModified = function(item, $event) {
    	if(item.lock_owner == $rootScope.user_name) {
    		$event.stopPropagation();
    		this.treedata = [];
    		this.parent = item;
    		this.parents.push(item);
    		this.codetable = item.name ? item.name : this.codetable;
    		this.codetableId = item.id ? item.id : 'root';
    		$rootScope.setLoader('loader.' + $state.current.name);
    		$rootScope.$CodetableListService.getModifiedRecords(item.name, undefined).then(function(result) {
    			$rootScope.$CodetableListService.treedata = result.data;
			}, function(error) {});
    	}
    	
    };
    
    this.goTo = function(item) {
    	var rootTitle = $filter('translate')('root.' + this.type);
        if (_.isArray(item) ) { item = item[0]; }

        if (angular.isUndefined(item.name) && angular.isUndefined(item.id)) {
            this.codetable = undefined;
            this.codetableId = undefined;
        } else {
            this.codetable = item.name ? item.name : this.codetable;
            this.codetableId = item.id ? item.id : 'root';
        }

        if (item.value || item.name) {
            this.parent = item;
            this.parents = _.first(this.parents, _.indexOf(this.parents, item)+1);
        } else {
            this.parent = {description: rootTitle};
            this.parents = [{description: rootTitle}];
        }
        
        this.loadData();
    };
    
    this.goUp = function() {
    	this.treedata = [];
        this.parents.pop();
        var item = this.parents[this.parents.length - 1];
        this.parent = this.parents[this.parents.length - 2];

        if (angular.isUndefined(item.name) && angular.isUndefined(item.id)) {
            this.codetable = undefined;
            this.codetableId = undefined;
        } else {
            this.codetable = item.name ? item.name : this.codetable;
            this.codetableId = item.id ? item.id : 'root';
        }

        this.loadData();
    };
    
    this.createParents = function(node, list) {
        node.description = node.text;
        list.push(node);
        if (node.parent) { this.createParents(node.parent, list); }
    };
    
    this.updateCache = function() {
    	if(angular.isUndefined($rootScope.cache)) {
    		$rootScope.cache = {};
    	}
    	if(angular.isUndefined($rootScope.cache[this.type])) {
    		$rootScope.cache[this.type] = {};
    	}
        $rootScope.cache[this.type].parents = this.parents;
        $rootScope.cache[this.type].parent = this.parent;
        $rootScope.cache[this.type].codetable = this.codetable;
        $rootScope.cache[this.type].codetableId = this.codetableId;
    };
    
    this.onSelected = function(node, selected, $parentNode) {
        node.parent = $parentNode;
        if (selected) { this.selectedNode = [node];
        } else { this.origSelectedNodes = []; }
    };
    
    this.findNode = function(selectedNode) {
        if (_.isArray(selectedNode) ) { selectedNode = selectedNode[0]; }

       // if leaf than select parent
        if (selectedNode.leaf) { selectedNode = selectedNode.parent; }

        var list = [];

        this.createParents(selectedNode, list);
        this.parents = this.parents.slice(0, 2);
        this.parents = this.parents.concat(list.reverse());
        this.codetable = selectedNode.name ? selectedNode.name : this.codetable;
        this.codetableId = selectedNode.id ? selectedNode.id : 'root';
        $rootScope.tree.opened = false;
        this.loadData();
    };
    
    this.showToggle = function(node, expanded, $parentNode, $index, $first, $middle, $last, $odd, $even) {
        node.parent = $parentNode;
    };
    
    this.codetableDelete = function(name, id) {
    	if(angular.isDefined(name) && angular.isDefined(id)) {
    		CodeTablesResource.codetableDelete({codetable: name, id: id}, 
    			function(response) {
    				var type = $rootScope.$CodetableListService.type;
    				var title = $filter('translate')('message.' + type + '.delete.title');
    				var message = $filter('translate')('message.' + type + '.delete.success');
    				$rootScope.$MessageService.writeSuccess(title, message, undefined, {codetable: name, id: id});
    				$state.go($state.current, $stateParams, {reload: true});
    			}, function(error) {
    				$rootScope.$MessageService.writeException(error);
    		});
    	}
    };
    
    this.codetableCreate = function(name, data) {
    	if(angular.isDefined(name)) {
    		CodeTablesResource.codetableCreate({codetable: name}, data,
    			function(response) {
    				var type = $rootScope.$CodetableListService.type;
    				var title = $filter('translate')('message.' + type + '.create.title');
    				var message = $filter('translate')('message.' + type + '.create.success');
    				$rootScope.$MessageService.writeSuccess(title, message, undefined, {codetable: name, data: data});
    				$state.go($state.current, $stateParams, {reload: true});
    			}, function(error) {
    				$rootScope.$MessageService.writeException(error);
    		});
    	}
    };
    
    this.codetableEdit = function(name, id, data) {
    	var deferred = $q.defer();
    	if(angular.isDefined(name) && angular.isDefined(id)) {
    		CodeTablesResource.codetableEdit({codetable: name, id: id}, data,
    			function(response) {
    				var type = $rootScope.$CodetableListService.type;
    				var title = $filter('translate')('message.' + type + '.edit.title');
    				var message = $filter('translate')('message.' + type + '.edit.success');
    				$rootScope.$MessageService.writeSuccess(title, message, undefined, {codetable: name, id: id, data: data});
    				deferred.resolve(response);
    			}, function(error) {
    				$rootScope.$MessageService.writeException(error);
    				deferred.reject(response);
    		});
    	} else {
    		deferred.reject('name or id is not defined...');
    	}
    	return deferred.promise;
    };
    
    this.checkout = function(name) {
    	if(angular.isDefined(name)) {
    		CodeTablesResource.codetableCheckout({codetable: name}, 
    			function(response) {
    				//console.log(response);
    			}, function(error) {
    				$rootScope.$MessageService.writeException(error);
    		});
    	}
    };
    
    this.cancelCheckout = function(name) {
    	if(angular.isDefined(name)) {
    		CodeTablesResource.codetableCancelCheckout({codetable: name}, 
    			function(response) {
    				var type = $rootScope.$CodetableListService.type;
    				var title = $filter('translate')('message.' + type + '.cancelcheckout.title');
    				var message = $filter('translate')('message.' + type + '.cancelcheckout.success');
    				$rootScope.$MessageService.writeSuccess(title, message, undefined, name);
    				//$state.go($state.current, $stateParams, {reload: true});
					$rootScope.$CodetableListService.goTo($rootScope.$CodetableListService.parents[0]);
    			}, function(error) {
    				$rootScope.$MessageService.writeException(error);
    		});
    	}
    };
    
    this.checkin = function(name, forceminor) {
    	if(angular.isDefined(name)) {
    		CodeTablesResource.codetableCheckin({codetable: name, forceminor: forceminor}, 
    			function(response) {
    				var type = $rootScope.$CodetableListService.type;
    				var title = $filter('translate')('message.' + type + '.checkin.title');
    				var message = $filter('translate')('message.' + type + '.checkin.success');
    				$rootScope.$MessageService.writeSuccess(title, message, undefined, name);
    				//$state.go($state.current, $stateParams, {reload: true});
					$rootScope.$CodetableListService.goTo($rootScope.$CodetableListService.parents[0]);
            	}, function(error) {
            		$rootScope.$MessageService.writeException(error);
            });
    	}
    };

	this.unyellow = function(name) {
		if(angular.isDefined(name)) {
			CodeTablesResource.codetableUnyellow({codetable: name},
				function(response) {
					var type = $rootScope.$CodetableListService.type;
					var title = $filter('translate')('message.' + type + '.unyellow.title');
					var message = $filter('translate')('message.' + type + '.unyellow.success');
					$rootScope.$MessageService.writeSuccess(title, message, undefined, name);

				}, function(error) {
					$rootScope.$MessageService.writeException(error);
				});
		}
	};
    
    this.getModifiedRecords = function(codetable, index) {
    	var deferred = $q.defer();
		$rootScope.setLoader('loader.' + $state.current.name);
		 CodeTablesResource.getModifiedRecords({codetable: codetable}, 
		 function(response) {
			if(angular.isDefined(index)) {
				var changes = {deleted: 0, edited: 0, created: 0};
				for(var i = 0; i < response.data.length; i++) {
					if(response.data[i].deleted == true) { changes.deleted = changes.deleted + 1; }
					if(response.data[i].edited == true) { changes.edited = changes.edited + 1; }
					if(response.data[i].new == true) { changes.created = changes.created + 1; }
				}	
 				$rootScope.$CodetableListService.treedata[index].changes = changes;		
 			}
			deferred.resolve(response);
		 }, function(error) {
			 $rootScope.$MessageService.writeException(error);
			 deferred.reject(error);
		 });
		 return deferred.promise;
    };
    
    this.loadCodetables = function() {
		$rootScope.setLoader('loader.' + $state.current.name);
    	CodeTablesResource.listAll({operation: this.type}, 
            function (response) {
    			if (response.data) {
                    $rootScope.$CodetableListService.codetables = response.data;
    			} else {
                    $rootScope.$CodetableListService.codetables = [response];
                }
    			for(var index = 0; index < $rootScope.$CodetableListService.codetables.length; index++) {
    				$rootScope.$CodetableListService.codetables[index].id = 'root';
    				$rootScope.$CodetableListService.codetables[index].text = $rootScope.$CodetableListService.codetables[index].name;
    			}
                //$rootScope.cache.codebooks.codebookRoot = $rootScope.$CodetableListService.treedata;
            }, function (error) {
            	$rootScope.$CodetableListService.parents.pop();
                $rootScope.$MessageService.writeException(error);
        });
    };
    
    this.openCodetable = function(item) {
		$rootScope.setLoader('loader.' + $state.current.name);
    	if(item.id && item.id == 'root') {
    		CodeTablesResource.list({codetable: item.name, id: item.id, nodes: 'modifiednodes'},
    		function(response) {
    			var children = [];
    			if(response.data) {
    				_.findWhere($rootScope.$CodetableListService.codetables, {name: item.name}).children = response.data;
    			} else if(response.id) {
    				_.findWhere($rootScope.$CodetableListService.codetables, {name: item.name}).children = [response];
    			}
    			_.findWhere($rootScope.$CodetableListService.codetables, {name: item.name}).opened = true;
    			console.log(response);
    			//console.log(_.findWhere($rootScope.$CodetableListService.codetables, {name: item.name}));
    		}, function (error) {
    			$rootScope.$MessageService.writeException(error);
    		});    		
    	}
    };
    
    this.isOpened = function(id) {
    	return angular.isDefined(_.findWhere(this.opened, {id: id, name: this.codetable}));
    }
    
    this.openCodetableFolder = function(id) {
    	var temp = _.findWhere(this.opened, {id: id, name: this.codetable});
    	if(angular.isDefined(temp)) {
    		this.opened = _.without(this.opened, temp);
    	} else {
    		this.opened.push({id: id, name: this.codetable})
    	}
    }
    
    this.loadData = function() {

		$('#quick-search').val("");

		$rootScope.id = undefined;

        if (this.codetable) {
    		$rootScope.setLoader('loader.' + $state.current.name);
            CodeTablesResource.list({codetable: this.codetable, id: this.codetableId, nodes: 'modifiednodes'},
            	function(response) {
                	$rootScope.tree.opened = false;
                	$("html, body").scrollTop(0);
                	if (response.data != undefined) {
                		$rootScope.$CodetableListService.treedata = response.data;
                	} else {
                		$rootScope.$CodetableListService.treedata = [response];
                	}

                	if ($rootScope.$CodetableListService.codetableId === "root") {
                		$rootScope.$CodetableListService.treedataFilter = $rootScope.$CodetableListService.treedata;
                	}
            	}, function (error) {
            		$rootScope.$CodetableListService.parents.pop();
            		$rootScope.$MessageService.writeException(error);
            });
        } else {
            $rootScope.tree.opened = false;
            $("html, body").scrollTop(0);

            //if (angular.isUndefined($rootScope.cache.codebooks.codebookRoot)) {
    		$rootScope.setLoader('loader.' + $state.current.name);
            CodeTablesResource.listAll({operation: this.type},
                	function (response) {
                        if (response.data != undefined) {
                        	$rootScope.$CodetableListService.treedata = response.data;
                        } else {
                        	$rootScope.$CodetableListService.treedata = [response];
                        }
                        
                        for(var index = 0; index < $rootScope.$CodetableListService.treedata.length; index++) {
                        	var cdtbl = $rootScope.$CodetableListService.treedata[index];
                        	if(cdtbl.lock_owner == $rootScope.user_name) {
                        		$rootScope.$CodetableListService.getModifiedRecords(cdtbl.name, index).then(function(result) {
          						}, function(error) {});
                        	}
                        }
                        $rootScope.cache[$rootScope.$CodetableListService.type].codebookRoot = $rootScope.$CodetableListService.treedata;
                    }, function (error) {
                    	$rootScope.$CodetableListService.parents.pop();
                        $rootScope.$MessageService.writeException(error);
                    });
            //} else {
            //    this.treedata = $rootScope.cache.codebooks.codebookRoot;
            //}
        }
    };
	
 }])
 
 .service('CodetableDetailService', ['$q', '$rootScope', '$state', '$stateParams', '$cookieStore', '$filter', 'CodeTablesResource',
        function ($q, $rootScope, $state, $stateParams, $cookieStore, $filter, CodeTablesResource) {
	 
	 this.getCodebookForm = function(codetable, id) {
		var deferred = $q.defer();
		CodeTablesResource.codetableDetailForm({codetable: codetable, id: id}, 
		function(response) {
			deferred.resolve(response[$filter('filter')(_.allKeys(response), 'form', false)[0]]);
		}, function(error) {
			$rootScope.$MessageService.writeException(error);
			deferred.reject(error);
		});
		return deferred.promise;
	 };
	 
	 this.getCodebookData = function(codetable, id) {
		 var deferred = $q.defer();
		 CodeTablesResource.detail({codetable: codetable, id: id}, 
         	function(response) {
			 	deferred.resolve(response);
         }, function(error) {
         	$rootScope.$MessageService.writeException(error);
         	deferred.reject(error);
         });
		 return deferred.promise;
	 };
	 
	 this.tarifPreview = function(codetable) {
		 var deferred = $q.defer();
		 CodeTablesResource.tarifPreview({codetable: codetable}, 
		         	function(response) {
			 	deferred.resolve(response);
		 }, function(error) {
			 $rootScope.$MessageService.writeException(error);
			 deferred.reject(error);
		 });
		 return deferred.promise;
	 }
   
	
 }]);
