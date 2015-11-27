angular.module('service-list', ['ui.router'])
.service('ListService', ['$q', '$rootScope', '$state', '$stateParams', 'CommonResource', 'DocumentsResource', 'DocumentResource',
        function ($q, $rootScope, $state, $stateParams, CommonResource, DocumentsResource, DocumentResource ) {
	this.itemsPerPage = 50;
	this.property = "r_modify_date";
	this.direction = "desc";
	this.editedItems = [];
	this.multiselect = [];
	this.items = {};
	this.folders = {};
	this.currentPage = {};
	this.currentSearch = {};
	this.searchApi ="quick_search";
	this.type = undefined;
	this.hideFilter = undefined;
	this.busy = {};
	this.webcabinets = {};
	this.webcabinetsIsSearch = {};
	this.params = "";

	this.reinit = function() {
		this.itemsPerPage = 50;
		this.property = "r_modify_date";
		this.direction = "desc";
		this.editedItems = [];
		this.multiselect = [];
		this.items = {};
		this.folders = {};
		this.currentPage = {};
		this.currentSearch = {};
		this.searchApi ="quick_search";
		this.filter = undefined;
		this.type = undefined;
		this.disableFilter = undefined;
		this.busy = {};
		this.params = "";
	};
	
	this.getType = function() {
		var statename = $state.current.name.replace('.', '_');
		if(angular.isDefined(this.is_modal)) {
			return statename + '_modal';
		}
		return $state.current.name.replace('.', '_');
	};
	
	this.closeModal = function() {
		delete this.is_modal;
	};
	
	this.getStateClass = function(item) {
		if(item.current_state == 5) {
			if(_.indexOf(item.r_version_label, 'Expired') != -1) {
				return 'greyTag';
			} else {
				return 'greenTag';
			}
		} else if(item.current_state == 1) {

		}

		return 'orangeTag';
	};
	
	// INIT LIST
	this.init = function(listType, type, hideFilter, rootFolder, searchApi, is_modal, params) {
		var deferred = $q.defer();
		if(angular.isDefined(is_modal)) {
			this.is_modal = '_modal';
		} else {
			delete this.modal;
		}
	 	this.multiselect = [];
	 	this.items[this.getType()] = [];
	 	this.folders[this.getType()] = [];
	 	this.type = type;
	 	this.hideFilter = hideFilter;
	 	this.currentPage[this.getType()] = 1;
		this.currentSearch[this.getType()] = false;
	 	this.busy[this.getType()] = false;


	 	//this.advancedTemplate = undefined;
	 	//this.advancedFilter = undefined;

	 	this.webcabinets[this.getType()] = listType == 'webcabinets';
		this.webcabinetsIsSearch[this.getType()] = false;

		this.rootfolder = angular.isDefined(rootFolder) ? rootFolder : "/";
		this.searchApi = (angular.isDefined(searchApi) && searchApi !== "") ? searchApi : "quick_search";
		this.params = angular.isDefined(params) ? params : "";
	 	
	 	// INIT WEB CABINETS
	 	if(this.webcabinets[this.getType()] == true) {
	 		if(angular.isUndefined(this.parents)) {
	 			this.parents = [{title:"WCM", index:0}];
	 		}
			this.initWebCabinets();

			if (angular.isDefined(rootFolder) && rootFolder !== "/") {

				this.openPath(rootFolder);
			}

	 		this.updateCache();
	 	}
	 	
	 	// CHECKING WEBCABINETS CACHE
	 	if(angular.isUndefined($rootScope.cache.webcabinets)) {
	 		$rootScope.cache.webcabinets = {};
	 	}

	 	// INIT FILTER
	 	if(angular.isUndefined(this.filter)) {
	 		this.initFilter(true);
	 	}
	 	
	 	$rootScope.$DetailService.reloadDetail(true);
	 	$rootScope.$ListService.loadItems();
	};
		
	// COMMON FUNCTIONS

	this.updateInList = function (newItem, disable, list) {

		var itemList = this.items[this.getType()]
		var add = true;

		if (angular.isUndefined(itemList) && angular.isDefined($rootScope.$InboxDetailService) && angular.isDefined($rootScope.$InboxDetailService.metadata) && angular.isDefined($rootScope.$InboxDetailService.metadata.workflow_documents)) {
			itemList = $rootScope.$InboxDetailService.metadata.workflow_documents;

			var workflowPost = _.map(itemList, function(x) {return x.chronicle_id; }).indexOf(newItem.chronicle_id);

			if (workflowPost === -1) {
				add = false;
			}
		}

		if (angular.isDefined(list)) {
			itemList = list;
		}

		if(_.isArray(itemList) == false) {
			itemList = [];
		}

		if (angular.isDefined(newItem)) {
			var elementPos = _.map(this.editedItems, function(x) {
				if (angular.isDefined(x)) { return x.chronicle_id; }
				return -1;
			}).indexOf(newItem.chronicle_id);

			if (disable) {
				if (elementPos === -1) { this.editedItems.push(newItem); }
				else { this.editedItems[elementPos] = newItem; }
			} else {
				if (elementPos !== -1) { delete this.editedItems[elementPos]; }
			}
			elementPos = _.map(itemList, function(x) {return x.chronicle_id; }).indexOf(newItem.chronicle_id);

			if (angular.isDefined(elementPos) && elementPos >= 0 && itemList.length > elementPos) {
				if (angular.isDefined(disable)){ newItem.disable = disable; }
				itemList[elementPos] = newItem;
			} else if (angular.isDefined(itemList) && add) {
				newItem.disable = disable;
				itemList.unshift(newItem);
			}
		}
	}

	this.refreshListItem = function (newItem, disable, list, forceCancelCheckout) {

		// cancel checkout if doc is lock
		if (! disable) {
			if (newItem.lock_owner === $rootScope.user_name && ($state.current.name != 'document' || forceCancelCheckout)) {
				DocumentResource.documentCancelCheckout({documentId: newItem.id}
					, function (response) {
						$rootScope.$ListService.updateInList(response, disable, list);
					}, function (error) {
						$rootScope.$ListService.updateInList(newItem, disable, list);
					});
			}
			else {
				$rootScope.$ListService.updateInList(newItem, disable, list);
			}
		}
		else {
			$rootScope.$ListService.updateInList(newItem, disable, list);
		}
	};

	this.isMultiselectEnabled = function() {
		return ($state.current.name != 'dashboard.inbox' && $state.current.name != 'document');
	};

	this.clearItems = function() {
		var deferred = $q.defer();
		this.items[this.getType()] = [];
       	this.folders[this.getType()] = [];
       	this.multiselect = [];
	};
	
	this.replaceItem = function(item) {
		if(this.webcabinets[this.getType()] == false) {
			$rootScope.$ListService.reloadItem(item).then(function(result) {
				var index = _.indexOf($rootScope.$ListService.items[$rootScope.$ListService.getType()], item);
				if(index > -1 && angular.isDefined(result)) {
					$rootScope.$ListService.items[$rootScope.$ListService.getType()].splice(index, 1, result);				
				} else {
					$state.go($state.current, {}, {reload: true});
				}
				if(angular.isDefined($rootScope.$DetailService.detail) && item.id === $rootScope.$DetailService.detail.id) {
					$rootScope.$DetailService.reloadDetail(true);
				}
			});
		} else {
			$state.go($state.current, {}, {reload: true});
		}
	};
	
	this.replaceItems = function(ids) {
		for(var i = 0; i < ids.length; i++) {
			this.replaceItem({id: ids[i]});
		}
	};
       
    this.reloadItem = function(item) {
    	var deferred = $q.defer();
    	if(angular.isDefined(item)) {

			DocumentResource.getDocument({documentId: item.id}, function(response) {
				deferred.resolve(response);
			}, function(error) {
				$rootScope.$MessageService.writeException(error);
				deferred.reject(error);
			});
    	} else {
    		$state.go($state.current, {}, {reload: true});
			deferred.reject('');
    	}
    	return deferred.promise;
    };
		
    this.removeItem = function(item) {
    	if(angular.isDefined(item) && item.id != '') {
    		this.items[this.getType()] = _.without(this.items[this.getType()], _.findWhere(this.items[this.getType()], {id: item.id}));        		 
    	}
    };
		
    this.addItem = function(item) {
    	var deferred = $q.defer();
    	var elementPos = _.map(this.items, function(x) {return x.chronicle_id; }).indexOf(item.chronicle_id);
    	if (elementPos === -1) { this.items[this.getType()].push(item); }
    };
		
    this.addItems = function(array) {
    	var deferred = $q.defer();			
    	for(var i = 0; i < array.length; i++) {
    		var elementPos = _.map(this.items[this.getType()], function(x) {return x.chronicle_id; }).indexOf(array[i].chronicle_id);
			if (elementPos === -1) { this.items[this.getType()].push(array[i]); }
    	}

    };
		
    this.clearDetail = function(item) {
    	var deferred = $q.defer();
    	if(angular.isUndefined(item) || item.id === this.detail.id) {
       		this.detail = undefined;
       	}
    };
		
    // FILTER 
    this.initFilter = function(force) {
    	var deferred = $q.defer();
		if(angular.isUndefined(this.filter) || force == true) {
			this.filter = {};
			this.filter.selected = {};
			this.filter.opened = false;
			this.filter.active = false;
			CommonResource.filter({},
				function(response) {
					 $rootScope.$ListService.filter.filters = response.filter;
				 }, function(error) {
					 $rootScope.$MessageService.writeException(error);
			});  
		}
    };
    
    this.getPostfix = function() {
    	var deferred = $q.defer();
    	var postfix = '';
    	if(angular.isUndefined(this.hideFilter)) {
    		if(angular.isDefined(this.filter) && this.filter.active == true) {					
    			if(angular.isDefined(this.filter.selected) && this.filter.selected != {}) {
    				var keys = _.keys(this.filter.selected);
    				if(keys.length) {							
    					for(var index = 0; index < keys.length; index++) {
    						if(angular.isDefined(this.filter.selected[keys[index]]) && angular.isDefined(this.filter.selected[keys[index]].filter)) {
								if(this.filter.selected[keys[index]].filter[0].postfix) {
									postfix = '.' + this.filter.selected[keys[index]].filter[0].postfix;
								}
							}
    					}
    				}
    			}
    		}
    	}
    	return postfix;
    };
		
    this.getFilterString = function() {			
    	var deferred = $q.defer();			
    	var array = [];
    	if(angular.isUndefined(this.hideFilter)) {
    		if(angular.isDefined(this.filter) && this.filter.active == true) {					
    			if(angular.isDefined(this.filter.selected) && this.filter.selected != {}) {
    				var keys = _.keys(this.filter.selected);
    				if(keys.length) {
    					for(var index = 0; index < keys.length; index++) {
    						if(angular.isDefined(this.filter.selected[keys[index]]) && angular.isDefined(this.filter.selected[keys[index]].filter)) {
								array.push({
									property: this.filter.selected[keys[index]].filter[0].property, 
									operator: this.filter.selected[keys[index]].filter[0].operator, 
									value: this.filter.selected[keys[index]].filter[0].value
								});
							} else { delete this.filter.selected[keys[index]]; }
    					}
    				}
    			}
    		}
    	}
		
    	if(array.length) {
    		var filterString = '';
    		for(var index = 0; index < array.length; index++) {
    			var property = array[index].property;
    			for(var idx = 0; idx < this.filter.filters.length; idx++) {
    				for(var i = 0; i < this.filter.filters[idx].items.length; i++) {
    					var filterItem = _.findWhere(this.filter.filters[idx].items[i].filter, {property: property});
    					if(angular.isDefined(filterItem) && filterItem.value == array[index].value) {
    						filterString += this.filter.filters[idx].text + ': ' + this.filter.filters[idx].items[i].title + '; ';
    					}
    				} 
    			}
    		}
    		this.filter.filterString = filterString;
    	} else {
			if (angular.isDefined(this.filter)) {
				delete this.filter.filterString;
			}
    	}
    	
    	return JSON.stringify(array);
    };

    this.clearFilter = function() {
		var deferred = $q.defer();
		this.filter.selected = {};
		this.filter.active = false;
		$state.go($state.current, {}, {reload: true});
	};
		
	this.applyFilter = function() {
		var deferred = $q.defer();
		this.multiselect = [];
		this.items[this.getType()] = [];
		this.currentPage[this.getType()] = 1;
		this.busy[this.getType()] = false;
			
		this.filter.active = true;
		if(this.getFilterString() == '[]') {
			this.filter.active = false;
		}
		this.loadItems();
	}
		
	// SORT
		
	this.sort = function(property) {
		var deferred = $q.defer();
		this.property = property;
		this.direction = this.direction === 'desc' ? 'asc' : 'desc';
		this.currentPage[this.getType()] = 1;
		this.busy[this.getType()] = false;
		this.items[this.getType()] = [];
		this.loadItems();
	};
		
	// SELECT & MULTISELECT
		
	this.clearMultiselect = function() {
		var deferred = $q.defer();
       	this.multiselect = [];
	};
		
	this.selectRow = function(item) {
		var deferred = $q.defer();
       	if(angular.isUndefined(this.multiselect)) { this.multiselect = []; }
       	
       	// SHIFT
       	if(this.multiselect.length && $rootScope.shifted) {
       		var lastAddedIndex = _.indexOf(this.items[this.getType()], _.last(this.multiselect));
       		var clickedIndex = _.indexOf(this.items[this.getType()], item);
       		for(var index = Math.min(lastAddedIndex, clickedIndex); index <= Math.max(lastAddedIndex, clickedIndex); index++) {
       			var listItem = this.items[this.getType()][index];
       			var temp = _.findWhere(this.multiselect, {id: listItem.id});
       			if(angular.isUndefined(temp)) {
           			this.multiselect.push(listItem);
           		} else {
           			this.multiselect = _.without(this.multiselect, temp);
           			this.multiselect.push(listItem);
           		} 
       		}
       	} else {
       		var temp = _.findWhere(this.multiselect, {id: item.id});
       		if(angular.isUndefined(temp)) {
       			this.multiselect.push(item);
       		} else {
       			this.multiselect = _.without(this.multiselect, temp);
       		}        		
       	}
	};
       
	this.isSelectedRow = function(item) {
       	var deferred = $q.defer();
       	var temp = _.findWhere(this.multiselect, {id: item.id});
       	return angular.isDefined(temp);
	};


	// WEB CABINETS
	
	this.getPath = function() {
		var path = '/';
		for(var i = 1; i < this.parents.length; i++) {
			path = path + this.parents[i].title ;
			if(i < this.parents.length-1) { path = path + '/'; }
		}
		return path;
	}

	this.setWebCabinetsParentItem = function() {
		if(this.parents.length == 1) {
			this.parent = _.last(this.parents);
			this.clearItems();
			this.updateCache();
			this.loadPortals();

			//$rootScope.$ListService.clearItems();
			this.folders[this.getType()] = this.cabinetPortals;
		} else if(this.parents.length == 2) {
			this.parent = _.last(this.parents);
			this.loadItems();
			this.updateCache();
		} else if(this.parents.length > 2) {
			DocumentsResource.folderFav({ path: this.getPath() },
				function(response) {
					$rootScope.$ListService.parent = {id: response.id, title: _.last($rootScope.$ListService.parents).title, index:_.last($rootScope.$ListService.parents).index, can_subscribe: response.is_fav == 'false'}
					_.last($rootScope.$ListService.parents).id = response.id;
					_.last($rootScope.$ListService.parents).can_subscribe = response.is_fav == 'false';

					$rootScope.$ListService.loadItems();
					$rootScope.$ListService.updateCache();
				}, function(error) {
					$rootScope.$MessageService.writeException(error);
			});
		}
	};

	this.initWebCabinets = function() {
       	if(this.webcabinets[this.getType()] == true && angular.isDefined($stateParams.path)) {
       		this.openPath($stateParams.path);
       	} else {
       		if(this.webcabinets[this.getType()] == true && $rootScope.cache.webcabinets && $rootScope.cache.webcabinets.parents && $rootScope.cache.webcabinets.parents.length) {
       			this.parents = $rootScope.cache.webcabinets.parents;
       			this.parent = this.parents.length > 1 ? _.last(this.parents) : undefined;
       			this.setWebCabinetsParentItem();
       		} else {
       			this.loadPortals();
       			this.folders[this.getType()] = this.cabinetPortals;
       		}
       	}
	};

	this.updateCache = function() {
   		var cache = {};
   		cache.parents = this.parents;
   		$rootScope.cache.webcabinets = cache;
	};
       
	this.goUp = function() {
   		this.currentPage[this.getType()] = 1;
   		this.folders[this.getType()] = [];
   		this.busy[this.getType()] = false;
		this.webcabinetsIsSearch[this.getType()] = false;

   		this.parents = _.initial(this.parents);
   		this.setWebCabinetsParentItem();
   	};
   	
   	this.goTo = function(item) {
   		//if((_.indexOf(this.parents, item)+1) == this.parents.length) {
   		//	return;
   		//}
   		this.currentPage[this.getType()] = 1;
   		this.busy[this.getType()] = false;
		this.webcabinetsIsSearch[this.getType()] = false;

   		this.parents = _.first(this.parents, _.indexOf(this.parents, item)+1);
   		this.setWebCabinetsParentItem();
   	};
   	
   	this.openPath = function(path) {
   		var last = undefined;
   		this.busy[this.getType()] = false;
   		this.currentPage[this.getType()] = 1;
		this.webcabinetsIsSearch[this.getType()] = false;
   		var array = [{title:"WCM", index:0}]
   		var paths = unescape(path).split('/');
   		for(var i = 1; i < paths.length; i++) {
   			var p = {title: paths[i], index: array.length};
   			array.push(p);				
   		}
   		this.parents = array;
   		this.setWebCabinetsParentItem();
   	}
   	
   	this.openFolder = function(item) {
   		this.currentPage[this.getType()] = 1;
		this.webcabinetsIsSearch[this.getType()] = false;
   		this.busy[this.getType()] = false;
   		var newParent = item.title;
   		if(angular.isUndefined(item.title) || item.title == '') { newParent = item.name; }
   		if(this.parents.length == 1) { newParent = item.object_name; }
   		
   		var p = {title:newParent, index: this.parents.length, can_subscribe: item.can_subscribe, id: item.id, is_rulefolder: item.is_rulefolder};
   		this.parents.push(p);
   		this.setWebCabinetsParentItem();
   	};
   	
   	this.loadPortals = function() {
   		DocumentsResource.webcabinetsRoot({}, null , function (response) {
   			if(response.data) {
   				$rootScope.$ListService.cabinetsPortals = response.data;
   			} else {
   				$rootScope.$ListService.cabinetsPortals = [];
   				$rootScope.$ListService.cabinetsPortals.push(response);
   			}
   			$rootScope.$ListService.folders[$rootScope.$ListService.getType()] = $rootScope.$ListService.cabinetsPortals;
   		}, function (error) {
   			$rootScope.$MessageService.writeException(error);
   		});
   	};
   	
   	// LOADING ITEMS
       
   	this.loadItems = function(filter) {
   		var deferred = $q.defer();
   		if(this.busy[this.getType()]) return;
   		if(this.currentPage[this.getType()] > 1) {
			$rootScope.overlayClass = 'loading';

			var split = this.getType().split("_");


			if (split[1] === "modal") { //if (this.webcabinetsIsSearch[this.getType()] === true) {
				$rootScope.overlayClass = 'loadingBase';
			}
		}

   		this.busy[this.getType()] = true;
   		
   		if(this.currentPage[this.getType()] === 1 && this.currentSearch[this.getType()] === false && this.webcabinetsIsSearch[this.getType()] !== true) {
   			this.clearItems();
   			this.loadFavFolders();
   			this.loadWebCabinetsFolders();
   		}
		else if (this.currentPage[this.getType()] === 1 && this.webcabinetsIsSearch[this.getType()] === true) {
			this.clearItems();
		}
		//else if (this.currentSearch[this.getType()] === true) {
		//	this.webcabinetsSearch($rootScope.$ListService.predicate);
		//}
   		
   		this.loadFavItems();
   		this.loadMyItems();
   		this.searchItems($stateParams.searchString);
   		this.advancedSearchItems();
   		this.loadWebCabinetsItems();

   		this.currentPage[this.getType()]++;
   	};

	//this.webcabinetsSearchInit = function() {
	//	var deferred = $q.defer();
    //
	//	this.busy[this.getType()] = false;
	//	this.webcabinetsIsSearch[this.getType()] = true;
	//	this.loadItems();
	//}

   	// FAVORITES 
   	
   	this.loadFavFolders = function() {
   		var deferred = $q.defer();
   		if(this.getType() == 'dashboard_fav') {
   			this.folders[this.getType()] = [];
   			DocumentsResource.favFolders({}, function(response) {
   				if($rootScope.$ListService.getType() == 'dashboard_fav') {
   					if (response.data) { $rootScope.$ListService.folders[$rootScope.$ListService.getType()] = response.data;
   					} else {
   						if (response.id) { $rootScope.$ListService.folders[$rootScope.$ListService.getType()].push(response); }
   					}	   					
   				}
   			}, function(error) { $rootScope.$MessageService.writeException(error); });
   		}
   	};
   	
   	this.loadFavItems = function() {
   		var deferred = $q.defer();
   		if(this.getType() == 'dashboard_fav') {
   			DocumentsResource.list({
              	operation: 'subscriptions',
              	size: this.itemsPerPage,
              	page: this.currentPage[this.getType()],
              	sortBy: this.property,
              	direction: this.direction},
              	//filter: this.getFilterString()},
              	function(response) {
              		if($rootScope.$ListService.getType() == 'dashboard_fav') {
              			var children = [];
              			if (response.data) {
              				$rootScope.$ListService.busy[$rootScope.$ListService.getType()] = response.total < $rootScope.$ListService.itemsPerPage;
              				children = response.data;
              			} else {
              				if (response.id) { children.push(response); }
              			}
              			$rootScope.$ListService.addItems(children);
              		}
              	}, function(error) {
              		$rootScope.$MessageService.writeException(error);
            });
   		}
   	};
   	
   	// MY DOCUMENTS
   	
   	this.loadMyItems = function() {
   		var deferred = $q.defer();
   		if(this.getType() == 'dashboard_my') {
   			DocumentsResource.list({
   				operation: 'my_files' + this.getPostfix(),
              	size: this.itemsPerPage,
              	page: this.currentPage[this.getType()],
              	sortBy: this.property,
              	direction: this.direction,
                filter: this.getFilterString()},
              	function(response) {
                	if($rootScope.$ListService.getType() == 'dashboard_my') {
                		var children = [];
                		if (response.data) {
                			$rootScope.$ListService.busy[$rootScope.$ListService.getType()] = response.total < $rootScope.$ListService.itemsPerPage;
                			children = response.data;
                		} else {
                			if (response.id) { children.push(response); }
                		}
                		$rootScope.$ListService.addItems(children);
                		
                		angular.forEach($rootScope.$ListService.editedItems, function (value, key) {
                			$rootScope.$ListService.refreshListItem(value, value.disable);
                		});                		
                	}
                }, function(error) {
                	$rootScope.$MessageService.writeException(error);
                });
   		}
   	};
   	
   	// SEARCH

   	this.searchItems = function(search) {

   		var deferred = $q.defer();
   		if(this.getType() == 'dashboard_search' && angular.isDefined(search)) {
   		DocumentsResource.search({
   			searchString: search.toUpperCase(),
   			size: this.itemsPerPage,
   			page: this.currentPage[this.getType()],
   			sortBy: this.property,
   			direction: this.direction,
			searchApi: this.searchApi},
   			//filter: this.getFilterString()},
   			function(response) {             
   				if($rootScope.$ListService.getType() == 'dashboard_search') {
   					var children = [];
   					if (response.data) {
   						$rootScope.$ListService.busy[$rootScope.$ListService.getType()] = response.total < $rootScope.$ListService.itemsPerPage;
   						children = response.data;
   					} else {
   						if (response.id) { children.push(response); }
   					}
   					$rootScope.$ListService.addItems(children);   					
   				}
   			}, function(error) {
   				$rootScope.$MessageService.writeException(error);
   			});
   		}
   	};
   	
   	// ADVANCED SEARCH
   	
   	this.advancedSearchFind = function(filter, template) {
   		this.itemsPerPage = 50;
		this.property = "r_modify_date";
		this.direction = "desc";
		this.multiselect = [];
		this.items[this.getType()] = [];
		this.folders[this.getType()] = [];
		this.currentPage[this.getType()] = 1;
		this.busy[this.getType()] = false;

		if(angular.isDefined(template)) {
   			this.advancedTemplate = template;
   			//this.advancedFilter = filter;
   			this.loadItems();
   		}
   	};

   	this.advancedSearchItems = function() {
   		var deferred = $q.defer();

   		if(this.getType() == 'dashboard_advancedsearch') {
			if(angular.isDefined(this.advancedFilter) && this.advancedFilter.group.rules.length > 0) {
				DocumentsResource.advancedSearchPost({
						params: this.advancedTemplate,
						size: this.itemsPerPage,
						page: this.currentPage[this.getType()],
						sortBy: this.property,
						direction: this.direction
					},
					//filter: JSON.stringify(this.advancedFilter)},
					function (response) {
						if ($rootScope.$ListService.getType() == 'dashboard_advancedsearch') {
							var children = [];
							if (response.data) {
								$rootScope.$ListService.busy[$rootScope.$ListService.getType()] = response.total < $rootScope.$ListService.itemsPerPage;
								children = response.data;
							} else {
								if (response.id) {
									children.push(response);
								}
							}
							$rootScope.$ListService.addItems(children);
						}
					}, function (error) {
						$rootScope.$MessageService.writeException(error);
					});
			}
   		}
   	};
   	
   	// WEB CABINETS FOLDERS
   	
   	this.loadWebCabinetsFolders = function() {
   		var deferred = $q.defer();
   		if(this.webcabinets[this.getType()] == true) {
   			var path = '/';
   			for(var i = 1; i < this.parents.length; i++) {
   				path = path + this.parents[i].title ;
   				if(i < this.parents.length-1) { path = path + '/'; }
   			}
   			if(this.parents.length > 1) {
   				DocumentsResource.webcabinetsFolders({ folderId: path }, null, 
   					function (response) {
   					if($rootScope.$ListService.webcabinets[$rootScope.$ListService.getType()] == true) {
   						$rootScope.$ListService.folders[$rootScope.$ListService.getType()] = [];
   						if(response.data) {
   							$rootScope.$ListService.folders[$rootScope.$ListService.getType()] = response.data;
   						} else {
   							if(response.id) { $rootScope.$ListService.folders[$rootScope.$ListService.getType()].push(response); }   						
   						}
   					}
   				}, function (error) {
   					$rootScope.$MessageService.writeException(error);		
   				});
   			}
   		}
   	};
   	
   	this.loadWebCabinetsItems = function() {
   		var deferred = $q.defer();
   		if(this.webcabinets[this.getType()] == true && this.webcabinetsIsSearch[this.getType()] !== true) {
   			if(this.parents.length > 1) {

				var folder = this.getPath();

				if (angular.isDefined(this.params) && this.params !== "") {
					folder += ',' + this.params;
				}

				var postfix = angular.isDefined(this.getPostfix()) ? this.getPostfix() : "";

				if (this.parents[this.parents.length - 1].is_rulefolder) {
					var typeRules = "cabinet_files.rules";
				}
   				DocumentsResource.webcabinetsFiles({
   					operation: angular.isUndefined(typeRules) ? this.type + postfix : typeRules + postfix,
   					folderId: folder,
   					size: this.itemsPerPage,
   					page: this.currentPage[this.getType()],
   					sortBy: this.property,
   					direction: this.direction,
   					filter: this.getFilterString() 
   				}, null , function (response) {
   					if($rootScope.$ListService.webcabinets[$rootScope.$ListService.getType()] == true) {
   						var children = [];
   						if (response.data) {
   							$rootScope.$ListService.busy[$rootScope.$ListService.getType()] = response.total < $rootScope.$ListService.itemsPerPage;
   							children = response.data;
   						} else {
   							if (response.id) { children.push(response); }
   						}
   						
   						$rootScope.$ListService.addItems(children);
   					}
   				}, function (error) {
   					$rootScope.$MessageService.writeException(error);	
   				});
   			}
   		}
		else if(this.webcabinets[this.getType()] == true  && this.webcabinetsIsSearch[this.getType()] == true) {

			if(angular.isDefined(search)) {

				var searchString = this.predicate.toUpperCase();

				if (angular.isDefined(this.params) && this.params !== "") {
					searchString += ',' + this.params
				}
				DocumentsResource.search({
						searchString: searchString,
						size: this.itemsPerPage,
						page: this.currentPage[this.getType()],
						sortBy: this.property,
						direction: this.direction,
						searchApi: this.searchApi},
					//filter: this.getFilterString()},
					function(response) {
						if($rootScope.$ListService.webcabinets[$rootScope.$ListService.getType()] == true) {
							var children = [];
							if (response.data) {
								$rootScope.$ListService.busy[$rootScope.$ListService.getType()] = response.total < $rootScope.$ListService.itemsPerPage;
								children = response.data;

								$rootScope.$ListService.parents = [{title:"WCM", index:0}];
								//$rootScope.$ListService.updateCache();
							} else {
								if (response.id) { children.push(response); }
							}
							//$rootScope.$ListService.clearItems();
							$rootScope.$ListService.addItems(children);
						}
					}, function(error) {
						$rootScope.$MessageService.writeException(error);
					});
			}

		}
   	};

	this.webcabinetsSearch = function(search, page) {

		var deferred = $q.defer();

		this.currentPage[this.getType()] = 1;
		this.busy[this.getType()] = false;
		this.webcabinetsIsSearch[this.getType()] = true;

		this.loadItems();

    //
	//	//if (angular.isDefined(page)) {
	//	//	this.currentPage[this.getType()] = page;
	//	//}
    //
	//	this.currentSearch[this.getType()] = true;
    //
	//	var deferred = $q.defer();
	//	if(this.webcabinets[this.getType()] == true  && this.webcabinetsSearch[this.getType()] == true) {
    //
	//		if(angular.isDefined(search)) {
    //
	//			var searchString = search.toUpperCase();
    //
	//			if (angular.isDefined(this.params) && this.params !== "") {
	//				searchString += ',' + this.params
	//			}
	//			DocumentsResource.search({
	//					searchString: searchString,
	//					size: this.itemsPerPage,
	//					page: this.currentPage[this.getType()],
	//					sortBy: this.property,
	//					direction: this.direction,
	//					searchApi: this.searchApi},
	//				//filter: this.getFilterString()},
	//				function(response) {
	//					if($rootScope.$ListService.webcabinets[$rootScope.$ListService.getType()] == true) {
	//						var children = [];
	//						if (response.data) {
	//							$rootScope.$ListService.busy[$rootScope.$ListService.getType()] = response.total < $rootScope.$ListService.itemsPerPage;
	//							children = response.data;
	//
	//							$rootScope.$ListService.parents = [{title:"WCM", index:0}];
	//							//$rootScope.$ListService.updateCache();
	//						} else {
	//							if (response.id) { children.push(response); }
	//						}
	//						$rootScope.$ListService.clearItems();
	//						$rootScope.$ListService.addItems(children);
	//					}
	//				}, function(error) {
	//					$rootScope.$MessageService.writeException(error);
	//				});
	//		}
    //
	//	}
	};
}])
   
.service('InboxService', ['$q', '$rootScope', '$state', '$stateParams', 'DocumentsResource',
                             function ($q, $rootScope, $state, $stateParams, DocumentsResource) {
    	
	this.items = [];
	this.property = "r_modify_date";
	this.direction = "desc";
	
	this.reinit = function() {
		this.items = [];
		this.property = "r_modify_date";
		this.direction = "desc";
	};

	// INIT LIST
	 	
	this.init = function() {
		var deferred = $q.defer();
		this.loadItems();
		$rootScope.$InboxDetailService.reloadDetail(true);
	};
 		
	// SORT
	this.sort = function(property) {
		var deferred = $q.defer();
		this.property = property;
		this.direction = this.direction === 'desc' ? 'asc' : 'desc';
		this.loadItems();
	};
	
	// RELOAD ITEM
	
	this.replaceTask = function(item) {
		var index = _.indexOf($rootScope.$InboxService.items, item);
		if(index > -1) {
			var filter = [{property : 'item_id', operator : '=', value : item.item_id}];
			DocumentsResource.inboxList({
				sortBy: undefined,
				direction: undefined,
				filter: JSON.stringify(filter)}, 
				function(response) {
					if (response.id) {
						$rootScope.$InboxService.items.splice(index, 1, response);
						if(item.item_id === $rootScope.$InboxDetailService.detail.item_id) {
							 $rootScope.$InboxDetailService.reloadDetail(true);
						}
					} else {
						$state.go($state.current, {}, {reload: true});
					}
				}, function(error) {
		             $rootScope.$MessageService.writeException(error);
			});
		} 
	};

	
	// LOADING ITEMS
        
	this.loadItems = function() {
		var deferred = $q.defer();    		
		this.loadInboxItems();
		this.currentPage++;
	};
    	    	
	// INBOX ITEMS
	
	this.loadInboxItems = function() {
		var deferred = $q.defer();
		if($state.current.name == 'dashboard.inbox') {
			DocumentsResource.inboxList({
				sortBy: this.property,
				direction: this.direction,
				filter: '[]'}, 
				function(response) {
					$rootScope.$InboxService.items = [];
					if (response.data) {
						$rootScope.$InboxService.items = response.data;
					} else {
						if (response.id) { $rootScope.$InboxService.items = [response]; }
					}
				}, function(error) {
              		$rootScope.$MessageService.writeException(error);
            });    		
		}
	};
}]);