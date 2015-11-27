angular.module('service-detail', ['ui.router'])
.service('DetailService', ['$q', '$rootScope', '$state', 'DocumentsResource', '$sce', '$filter',
        function ($q, $rootScope, $state, DocumentsResource, $sce, $filter) {

  	 this.detail = undefined;
  	 this.metadata = undefined;
  	 this.src = undefined;
  	 this.ruleProtocol = undefined;
  	 
  	this.reinit = function() {
  		this.detail = undefined;
  	  	this.metadata = undefined;
  	  	this.src = undefined;
  	  	this.ruleProtocol = undefined;
	};
  	 
  	 // RELOAD DOC DETAIL
  	 this.reloadDetail = function(force) {
  		var deferred = $q.defer();
  		if(angular.isUndefined(force)) {
			force = false;
		}
  		if(angular.isDefined(this.detail)) {
  			var item = this.detail;
  			var temp = _.findWhere($rootScope.$ListService.items[$rootScope.$ListService.getType()], {chronicle_id: item.chronicle_id});
  			this.detail = undefined;
  			this.metadata = undefined;
  			this.src = undefined;
  			this.ruleProtocol = undefined;
  			if(force == true && angular.isDefined(temp)) { 
  				$rootScope.$ListService.reloadItem(item).then(function(result) {
  					var index = _.indexOf($rootScope.$ListService.items[$rootScope.$ListService.getType()], temp);
  					$rootScope.$ListService.items[$rootScope.$ListService.getType()].splice(index, 1, result);
  				}); 
  			}
    		else { this.documentDetail(item); }	
  		 }
  	 };
  	 
  	 // LOADING DOCUMENT DETAIL
  	 this.documentDetail = function(item) {
		var deferred = $q.defer();
		if($rootScope.shifted) {
			$rootScope.$ListService.selectRow(item);
      	} else {
      		if(angular.isDefined(this.detail) && this.detail.id == item.id) {
      			this.detail = undefined;
      			this.metadata = undefined;
      			this.src = undefined;
      			this.ruleProtocol = undefined;
      		} else {
      			this.metadata = undefined;
      			this.ruleProtocol = undefined;
      			$rootScope.overlayClass = 'docDetail' + item.id;
      			this.detail = item;
      			this.getDetailSrc(item);
      			if(item.is_rule == 1) {
      				DocumentsResource.rulePreview({id: item.id}, 
      				function(response) {

      					$rootScope.$DetailService.metadata = response;

						if ($rootScope.$DetailService.metadata.cancelled === 1) {
							$rootScope.$DetailService.metadata.rr_state = $filter('translate')("text.canceled");
						}
						else if ($rootScope.$DetailService.metadata.rr_state === "F") {
							$rootScope.$DetailService.metadata.rr_state = $filter('translate')("text.future");
						}
						else if ($rootScope.$DetailService.metadata.rr_state === "A") {
							$rootScope.$DetailService.metadata.rr_state = $filter('translate')("text.actual");
						}
						else if ($rootScope.$DetailService.metadata.rr_state === "H") {
							$rootScope.$DetailService.metadata.rr_state = $filter('translate')("text.historical");
						}
						else if ($rootScope.$DetailService.metadata.rr_state === "cancelled") {
							$rootScope.$DetailService.metadata.rr_state = $filter('translate')("text.canceled");
						}

      	      			$rootScope.overlayClass = 'docDetail' + item.id;
      					$rootScope.$DocumentOperationService.ruleProtocol(item.id).then(function(result) {
      						if(result.id) {
      							$rootScope.$DetailService.ruleProtocol = result;
      						}
  	  	  				}, function(error) {});
      				}, function(error) {
      					$rootScope.$MessageService.writeException(error);      							
      				});
      			} else {
      				DocumentsResource.docPreview({id: item.id}, 
      					function(response) {
      						$rootScope.$DetailService.metadata = response;
      					}, function(error) {
      						$rootScope.$MessageService.writeException(error);
      				});
      			}
      		}
      	}
	};
	
	// GETTING DOCUMENT SOURCE
	this.getResourceSrc = function(item) {
		if(this.getContentType(item) == 'xml') {
			return $sce.trustAsResourceUrl($rootScope.wcmConfig.backend + 'documents/' + item.id + '/rendition/html');
      	} else {
      		return $sce.trustAsResourceUrl($rootScope.wcmConfig.backend + 'documents/' + item.id + '/rendition');        		
      	}
	};
	
	this.getLink = function(name, lang) {

		if (name.indexOf('/') === 0) {
			return $rootScope.wcmConfig.backend + 'documents/' + lang + '' + name;
		}

		return $rootScope.wcmConfig.backend + 'documents/' + lang + '/' + name;

		//return $sce.trustAsResourceUrl($rootScope.wcmConfig.backend + 'documents/' + lang + '/' + name)
	};
	
	this.getDetailSrc = function(item) {
		if(this.getContentType(item) == 'xml') {
			this.src = $sce.trustAsResourceUrl($rootScope.wcmConfig.backend + 'documents/' + item.id + '/rendition/html');
      	} else {
      		this.src = $sce.trustAsResourceUrl($rootScope.wcmConfig.backend + 'documents/' + item.id + '/rendition');        		
      	}
	};
	
	this.getContentType = function(item) {

		if(angular.isDefined(item) && angular.isDefined(item.name)) {
    		var parts = item.name.split('.');
    		var extension = parts[parts.length - 1].toLowerCase();

    		if(extension == 'jpeg' || extension == 'jpg' || extension == 'png' || extension == 'gif') {
    			return "image";
    		} else if(extension == 'pdf') {
    			return "pdf";
    		} else if(extension == 'xml') {
    			return "xml";
    		} else if(extension == 'doc' || extension == 'docx') {
    			return "doc";
    		} else if(extension == 'xls' || extension == 'xlsx' || extension == 'xlt') {
    			return "xls";
    		} else if(extension == 'zip') {
    			return "zip";
    		} else if(extension == 'ppt' || extension == 'pps' || extension == 'ppsx' || extension == 'pptx') {
    			return "ppt";
    		} else if (extension == 'avi' || extension == 'flv' || extension == 'mp4' || extension == 'wmv') {
    			return "video";
    		} else if (extension == 'mp3' || extension == 'wma' || extension == 'ogg') {
				return "audio";
			}else {
    			return "unknown";
    		}
    	}
    	return "unknown";
	}
}])

.service('InboxDetailService', ['$q', '$rootScope', '$state', 'DocumentsResource',
        function ($q, $rootScope, $state, DocumentsResource) {

	this.detail = undefined;
	this.metadata = undefined;
	this.protocolId = undefined;
	
	this.reinit = function() {
  		this.detail = undefined;
  	  	this.metadata = undefined;
  	  	this.protocolId = undefined;
	};
	
	this.hasRule = function() {
		return angular.isDefined(_.findWhere(this.metadata.workflow_documents, {is_rule:'1'}));
	};	

	// RELOAD TASK DETAIL
	this.reloadDetail = function(force) {
  		var deferred = $q.defer();
  		if(angular.isUndefined(force)) {
			force = false;
		}
  		if(angular.isDefined(this.detail)) {
  			var item = this.detail;
  			var temp = _.findWhere($rootScope.$ListService.items[$rootScope.$ListService.getType()], {chronicle_id: item.chronicle_id});
  			this.detail = undefined;
  			this.protocolId = undefined;
  			this.metadata = undefined;
  			this.src = undefined;
  			this.ruleProtocol = undefined;
  			if(force == true && angular.isDefined(temp)) { 
  				$rootScope.$InboxService.reloadItem(temp).then(function(result) {
  					var index = _.indexOf($rootScope.$InboxService.items, temp);
  					$rootScope.$InboxService.items.splice(index, 1, result);
  				}); 
  			}
    		else {
    			this.detail = undefined;
        		this.metadata = undefined;
        		this.protocolId = undefined;
    			this.taskDetail(item); 
    		}	
  		 }
  	 };

	// LOADING TASK DETAIL
	this.taskDetail = function(item) {
		var deferred = $q.defer();
 		this.metadata = undefined;
 		this.protocolId = undefined;
 		if(angular.isDefined(this.detail) && this.detail.item_id == item.item_id) {
 			this.detail = undefined;
 		} else {
 			this.detail = item;
 			$rootScope.overlayClass = 'task_' + item.item_id;
            DocumentsResource.workflow({id: item.router_id}, 
            	function(response) {
            		if(response.id) {
                      	$rootScope.$InboxDetailService.metadata = response;
                      	
                      	// check protocol
                      	for(var index = 0; index < response.workflow_documents.length; index++) {
                      		if($rootScope.$InboxDetailService.protocolId == undefined && response.workflow_documents[index].is_rule == '1') {
                      			var document = response.workflow_documents[index];
                      			$rootScope.$DocumentOperationService.ruleProtocol(document.id).then(function(result) {
                      				if(result.id) {
                      					$rootScope.$InboxDetailService.protocolId = result.id;                      					
                      				}
                      			});
                      		}
                      	}

						angular.forEach($rootScope.$ListService.editedItems, function (value, key) {
							$rootScope.$ListService.refreshListItem(value, value.disable, $rootScope.$InboxDetailService.metadata.workflow_documents);
						});
            		}
            	}, function(error) {
            		$rootScope.$MessageService.writeException(error);
            });
 		}
 	};


}]);