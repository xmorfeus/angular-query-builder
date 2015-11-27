angular.module('service-operation', ['ui.router'])
.service('FolderOperationService', ['$q', '$rootScope', 'DocumentsResource', '$filter',
        function ($q, $rootScope, DocumentsResource, $filter) {
           	 
	this.subscribe = function(item) {
		var deferred = $q.defer();
		if(angular.isDefined(item.id)) {
			var title = item.name;
			DocumentsResource.addFav({id: item.id}, 
				function(response) {
					$rootScope.$ListService.parent.can_subscribe = false;
					var message = $filter('translate')("message.folder.fav.subscribe");
					$rootScope.$AuditService.addAuditItem('success', title, message, undefined, undefined);
				}, function(error) {
					$rootScope.$MessageService.writeException(error);
			});			
		}
	};
        		
	this.unsubscribe = function(item) {
		var deferred = $q.defer();
        if(angular.isDefined(item.id)) {
        	var title = item.name;
        	DocumentsResource.removeFav({id: item.id}, 
        		function(response) {
        			$rootScope.$ListService.parent.can_subscribe = true;
        			var message = $filter('translate')("message.folder.fav.unsubscribe");
        			$rootScope.$AuditService.addAuditItem('success', title, message, undefined, undefined);
        		}, function(error) {
        			$rootScope.$MessageService.writeException(error);
        	});			
        }
	};
}])

.service('UploadService', ['$q', '$rootScope', '$state', 'DocumentsResource', '$filter', 'Upload', 'ImportResource', 'wcmConfig',
        function ($q, $rootScope, $state, DocumentsResource, $filter, Upload, ImportResource, wcmConfig) {
	
	this.uploadedFiles = [];
	this.rejectedFiles = [];
	this.progress = undefined;
	this.$$scope = undefined;
	this.disableUniqueName = false;
	
	this.reinit = function() {
		this.uploadedFiles = [];
		this.rejectedFiles = [];
		this.progress = undefined;
		this.$$scope = undefined;
		this.disableUniqueName = false;
	};
	
	this.initFullUpload = function($$scope) {
		$rootScope.files = [];
		this.uploadedFiles = [];
		this.rejectedFiles = [];
		this.$$scope = $$scope;
		this.useForm = true;
		this.items = undefined;
		this.item = undefined;
		this.disableUniqueName = false;
		this.multi = true;
		this.pdfOnly = false;
		this.imagesOnly = false;
		this.reloadTpl = false;
	};
	
	this.initBaseImageUpload = function($$scope) {
		$rootScope.files = [];
		this.uploadedFiles = [];
		this.rejectedFiles = [];
		this.$$scope = $$scope;
		this.useForm = true;
		this.items = undefined;
		this.item = undefined;
		this.multi = true;
		this.disableUniqueName = false;
		this.pdfOnly = false;
		this.imagesOnly = true;
		this.reloadTpl = false;
	};

	this.initBaseUpload = function($$scope) {
		$rootScope.files = [];
		this.uploadedFiles = [];
		this.rejectedFiles = [];
		this.$$scope = $$scope;
		this.useForm = true;
		this.items = undefined;
		this.item = undefined;
		this.multi = true;
		this.disableUniqueName = false;
		this.pdfOnly = false;
		this.imagesOnly = false;
		this.reloadTpl = false;
	};
	
	this.initTarifUpload = function($$scope) {
		$rootScope.files = [];
		this.uploadedFiles = [];
		this.rejectedFiles = [];
		this.$$scope = $$scope;
		this.useForm = true;
		this.items = undefined;
		this.item = undefined;
		this.multi = true;
		this.disableUniqueName = false;
		this.pdfOnly = true;
		this.imagesOnly = false;
		this.reloadTpl = false;
	};
	
	this.initNewVersionUpload = function($$scope, multi) {
		$rootScope.files = [];
		this.uploadedFiles = [];
		this.rejectedFiles = [];
		this.$$scope = $$scope;
		this.useForm = false;
		this.multi = multi;
		this.disableUniqueName = false;
		this.pdfOnly = false;
		this.imagesOnly = false;
		this.reloadTpl = false;
		this.sameType = multi === true ? false : true;
	};
	
	this.initRuleAttachementUpload = function($$scope) {
		$rootScope.files = [];
		this.uploadedFiles = [];
		this.rejectedFiles = [];
		this.$$scope = $$scope;
		this.useForm = true;
		this.multi = true;
		this.disableUniqueName = true;
		this.pdfOnly = false;
		this.imagesOnly = false;
		this.reloadTpl = false;
		this.sameType = false;
	};
	
	// COMMON
	
	this.clearUpload = function() {
		$rootScope.files = [];
		this.uploadedFiles = [];
		this.rejectedFiles = [];
	};
	
	this.fitDropHeight = function() {
		var height = $('.cs-upload-result').height();
		if(height > 150) {
			$('.cs-upload-area').css('height', height + 'px');
			var margin = (height/2) + 40;
			if(margin > 115) {
				$('.cs-upload-area-text').css('margin-top', margin + 'px');			
			}			
		} else {
			$('.cs-upload-area').css('height', 150 + 'px');
			$('.cs-upload-area-text').css('margin-top', 115 + 'px');		
		}
	};
           	 
	this.upload = function(array) {
		if (array && array.length) {
			for (var i = 0; i < array.length; i++) {
				this.postFile(i);
			}
		}
	};
	
	this.reupload = function(file) {
		this.repostFile(file);
	};
	
	this.repostFile = function(file) {
    	if(this.checkDistinct(file, true) == false) { return; }
    	
    	if(this.multi == false && this.uploadedFiles.length === 1) {
			return;
		}
		
		file.name = angular.copy(file.modifiedName);
		$rootScope.setLoader('loader.importfile.validate');
		ImportResource.uniqueName({name: file.modifiedName}, 
			function (response) {
			if(response.result == true || $rootScope.$UploadService.disableUniqueName == true) {
				this.progressName = file.modifiedName;
				Upload.http({
					method: 'POST',
					url: wcmConfig.backend + 'content',
					headers: {'Content-Type': undefined, 'filename' : file.modifiedName},
					params: {ContentID: 'content'},
					transformRequest: function (data, headersGetter) {
						var formData = new FormData();
						formData.append('content', file);
						return formData;
					},
					data: file
				}).progress(function (evt) {
					$rootScope.$UploadService.progress = progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
				}).success(function (data, status, headers, config) {
					$rootScope.$UploadService.progress = undefined;              	
					if(data.size > 0) {
						config.data.info = {};
						config.data.info.id = data.id;
						config.data.info.type = data.type;
						config.data.info.contentType = data.contentType;
						config.data.info.title = file.modifiedName;
						config.data.info.abstract_ = file.modifiedName;
						if(config.data.type.indexOf('image') > -1) {
							config.data.info.type = "cms_picture";
						} else {
							config.data.info.type = "cms_attachment";
						}
						$rootScope.$UploadService.rejectedFiles = _.without($rootScope.$UploadService.rejectedFiles, file);
						$rootScope.$UploadService.uploadedFiles.push(config.data);
						if($rootScope.$UploadService.uploadedFiles.length == 1) {
							$rootScope.$UploadService.$$scope.selectFile($rootScope.$UploadService.uploadedFiles[0]);
						}
						$rootScope.$UploadService.fitDropHeight();
					} else {
						console.log("upload files ... data.size = 0")
					}
				}).error(function (data, status, headers, config) {
					var error = {data: data, config: config};
					$rootScope.$MessageService.writeException(error);
					$rootScope.$UploadService.progress = undefined;
				});
			} else {
				var title = file.name;
				var message = response.text;
				$rootScope.$MessageService.writeWarning(title, message, undefined, undefined);
			}
		}, function (error) {
			$rootScope.$MessageService.writeException(error);
			return false;
		});
	};
	
	this.repostNewVersion = function(file) {
		if(this.multi == false && this.uploadedFiles.length === 1) {
			return;
		}
		if(this.multi == true) {
			var tmp = _.findWhere(this.uploadedFiles, {name: file.modifiedName});
			if(angular.isDefined(tmp)) {
				return;
			} else {
				tmp = _.findWhere(this.uploadedFiles, {modifiedName: file.modifiedName});
				if(angular.isDefined(tmp)) {
					return;
				}
			}
		}
		this.progressName = file.modifiedName;
        Upload.http({
        	method: 'POST',
            url: wcmConfig.backend + 'content',
            headers: {'Content-Type': undefined},
            params: {ContentID: 'content'},
            transformRequest: function (data, headersGetter) {
            	var formData = new FormData();
            	formData.append('content', file);
            	return formData;
            },
            data: file
        }).progress(function (evt) {
        	$rootScope.$UploadService.progress = progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        }).success(function (data, status, headers, config) {
        	$rootScope.$UploadService.progress = undefined;            	
        	if(data.size > 0) {
        		config.data.info = {};
        		config.data.info.id = data.id;
        		config.data.info.type = data.type;
        		config.data.info.contentType = data.contentType;
        		config.data.info.docId = undefined;
        		if($rootScope.$UploadService.multi == true) {
        			var temp = _.findWhere($rootScope.$UploadService.$$scope.allows, {name: file.modifiedName});
        			if(angular.isDefined(temp)) {
        				config.data.info.docId = temp.id;
        			}            			
        		} else {
        			config.data.info.docId = $rootScope.$UploadService.$$scope.doc.id;
        		}
        		$rootScope.$UploadService.rejectedFiles = _.without($rootScope.$UploadService.rejectedFiles, file);
				$rootScope.$UploadService.uploadedFiles.push(config.data);
        	} else {
        		console.log("upload files ... data.size = 0 ... " + data.name)
        	}
        }).error(function (data, status, headers, config) {
        	var error = {data: data, config: config};
        	$rootScope.$MessageService.writeException(error);
        	$rootScope.$UploadService.progress = undefined;
        });
	}
	
	this.checkPdf = function(file) {
		if(file.name.search('.pdf') > 0) {
			return true;
		} else {
			var title = angular.isDefined(file.modifiedName) ? file.modifiedName : file.name;
			var message = $filter('translate')('message.document.import.notpdf');
			$rootScope.$MessageService.writeWarning(title, message, undefined, undefined);
			return false;
		}
	};
	
	this.checkImage = function(file) {
		if(file.name.toLowerCase().search('.jpg') > 0 || file.name.toLowerCase().search('.jpeg') > 0
				|| file.name.toLowerCase().search('.gif') > 0 || file.name.toLowerCase().search('.png') > 0
				|| file.name.toLowerCase().search('.bmp') > 0) {
			return true;
		} else {
			var title = angular.isDefined(file.modifiedName) ? file.modifiedName : file.name;
			var message = $filter('translate')('message.document.import.notimage');
			$rootScope.$MessageService.writeWarning(title, message, undefined, undefined);
			return false;
		}
	};

	this.checkSameType = function(file) {
		var oldFile = $rootScope.$UploadService.$$scope.doc;

		var fileType = file.name.split('.');
		var oldFileType = oldFile.name.split('.');

		if (angular.lowercase(fileType[fileType.length - 1]) === angular.lowercase(oldFileType[oldFileType.length - 1])) {
			return true;
		}

		var title = file.name;
		var message = $filter('translate')('message.document.import.notsametype');
		$rootScope.$MessageService.writeWarning(title, message, undefined, undefined);

		return false;
	}
	
	this.checkDistinct = function(file, repost) {
		var found = undefined;
		var title = undefined;
		if(angular.isDefined(file.modifiedName)) {
			title = file.modifiedName;
			found = _.findWhere(this.uploadedFiles, {modifiedName: file.modifiedName});
		} else {
			title = file.name;
			found = _.findWhere(this.uploadedFiles, {name: file.name});
		}
		if(angular.isDefined(found)) {
			var message = $filter('translate')('message.document.import.alreadyimported');
			$rootScope.$MessageService.writeWarning(title, message, undefined, undefined);
			if(repost == false) {
				this.rejected.push(file);
			}
			return false;
		}
		return true;
	};
	
	this.postFile = function(index) {
		var uFiles = [];
    	uFiles[index] = $rootScope.files[index];
    	
    	if(this.multi == false && this.uploadedFiles.length === 1) {
			return;
		}
		if(this.multi == true && angular.isDefined(this.$$scope.allows)) {
			var name = uFiles[index].name;
			var temp = _.findWhere($rootScope.$UploadService.$$scope.allows, {name: name});
			if(angular.isUndefined(temp)) {
				uFiles[index].modifiedName = name;
				this.rejectedFiles.push(uFiles[index]);
				return;
			}
		}

		if (this.sameType == true && this.checkSameType(uFiles[index]) == false) { return; }
    	if(this.imagesOnly == true && this.checkImage(uFiles[index]) == false) { return; }
    	if(this.pdfOnly == true && this.checkPdf(uFiles[index]) == false) { return; }
    	if(this.checkDistinct(uFiles[index], false) == false) { return; }
    	if(this.useForm == true) {
    		// UPLOAD WITH FORM
    		$rootScope.setLoader('loader.importfile.validate');
    		ImportResource.uniqueName({name: uFiles[index].name}, 
    				function (response) {
    			if(response.result == true || $rootScope.$UploadService.disableUniqueName == true) {
    				this.progressName = uFiles[index].name;
    				Upload.http({
    					method: 'POST',
    					url: wcmConfig.backend + 'content',
    					headers: {'Content-Type': undefined},
    					params: {ContentID: 'content'},
    					transformRequest: function (data, headersGetter) {
    						var formData = new FormData();
    						formData.append('content', uFiles[index]);
    						return formData;
    					},
    					data: uFiles[index]
    				}).progress(function (evt) {
    					$rootScope.$UploadService.progress = progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
    				}).success(function (data, status, headers, config) {
    					$rootScope.$UploadService.progress = undefined;              	
    					if(data.size > 0) {
    						config.data.info = {};
    						config.data.info.id = data.id;
    						config.data.info.type = data.type;
    						config.data.info.contentType = data.contentType;
    						config.data.info.title = data.name;
    						config.data.info.abstract_ = data.name;
    						if(config.data.type.indexOf('image') > -1) {
    							config.data.info.type = "cms_picture";
    						} else {
    							config.data.info.type = "cms_attachment";
    						}
    						$rootScope.$UploadService.uploadedFiles.push(config.data);
    						if($rootScope.$UploadService.uploadedFiles.length == 1) {
    							$rootScope.$UploadService.$$scope.selectFile($rootScope.$UploadService.uploadedFiles[0]);
    						}
    						$rootScope.$UploadService.fitDropHeight();
    					} else {
    						console.log("upload files ... data.size = 0")
    					}
    				}).error(function (data, status, headers, config) {
    					var error = {data: data, config: config};
    					$rootScope.$MessageService.writeException(error);
    					$rootScope.$UploadService.progress = undefined;
    				});
    			} else {
    				var title = uFiles[index].name;
    				var message = response.text;
    				$rootScope.$MessageService.writeWarning(title, message, undefined, undefined);
    				uFiles[index].modifiedName = angular.copy(uFiles[index].name);
    				$rootScope.$UploadService.rejectedFiles.push(uFiles[index]);
    			}
    		}, function (error) {
    			$rootScope.$MessageService.writeException(error);
    			return false;
    		});
    	} else {
    		// NEW VERSION    		
    		this.progressName = uFiles[index].name;
            Upload.http({
            	method: 'POST',
                url: wcmConfig.backend + 'content',
                headers: {'Content-Type': undefined},
                params: {ContentID: 'content'},
                transformRequest: function (data, headersGetter) {
                	var formData = new FormData();
                	formData.append('content', uFiles[index]);
                	return formData;
                },
                data: uFiles[index]
            }).progress(function (evt) {
            	$rootScope.$UploadService.progress = progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            }).success(function (data, status, headers, config) {
            	$rootScope.$UploadService.progress = undefined;            	
            	if(data.size > 0) {
            		config.data.info = {};
            		config.data.info.id = data.id;
            		config.data.info.type = data.type;
            		config.data.info.contentType = data.contentType;
            		config.data.info.docId = undefined;
            		if($rootScope.$UploadService.multi == true) {
            			var temp = _.findWhere($rootScope.$UploadService.$$scope.allows, {name: data.name});
            			if(angular.isDefined(temp)) {
            				config.data.info.docId = temp.id;
            			}            			
            		} else {
            			config.data.info.docId = $rootScope.$UploadService.$$scope.doc.id;
            		}
            		$rootScope.$UploadService.uploadedFiles.push(config.data);
            	} else {
            		console.log("upload files ... data.size = 0 ... " + data.name)
            	}
            }).error(function (data, status, headers, config) {
            	var error = {data: data, config: config};
            	$rootScope.$MessageService.writeException(error);
            	$rootScope.$UploadService.progress = undefined;
            });
    	}
	};
	
	this.getNewVersionPost = function() {
		var post = [];
    	for(var index = 0; index < $rootScope.$UploadService.uploadedFiles.length; index++) {
    		if(angular.isDefined($rootScope.$UploadService.uploadedFiles[index].info.docId)) {
    			post.push({id: $rootScope.$UploadService.uploadedFiles[index].info.docId, contentID: $rootScope.$UploadService.uploadedFiles[index].info.id})
    		} else {
    			console.log("Unable to pair with document... " + this.uploadedFiles[index].name);
    		}
    	}
    	return post;
	}
	
	this.checkNotEmptyUpload = function() {
		if(this.uploadedFiles.length == 0) {
			var title = $filter('translate')("message.document.save.title");
			var message = $filter('translate')("message.document.import.nofiles");
			$rootScope.$MessageService.writeWarning(title, message, undefined, undefined);
		}
		return this.uploadedFiles.length > 0;
	};

	this.removeFile = function(file) {
	    this.uploadedFiles =_.without(this.uploadedFiles, file);
	    this.fitDropHeight();
	};
	
	this.removeRejected = function(file) {
	    this.rejectedFiles =_.without(this.rejectedFiles, file);
	    this.fitDropHeight();
	};

	this.postUploadMetadata = function(array) {
		$rootScope.setLoader("loader.importfile.post");
		ImportResource.import({}, array, 
			function (response) {
				var title = $filter('translate')("message.document.save.title");
				var message = $filter('translate')("message.document.save.success");
				$rootScope.$MessageService.writeSuccess(title, message, undefined, array);
				$rootScope.$UploadService.uploadedFiles = [];
				if($rootScope.$UploadService.reloadTpl == true) {
					$rootScope.$UploadService.$$scope.loadTemplate();					
				}
				if($state.current.name == 'import') {
					$state.go('dashboard.my', {});					
				}
			}, function (error) {
				$rootScope.$MessageService.writeException(error);
		});
	};
}])
           
.service('DocumentOperationService', ['$q', '$rootScope', '$state', 'DocumentsResource', 
                                      '$filter', 'DocumentResource', 'WorkflowResource', '$stateParams',
        function ($q, $rootScope, $state, DocumentsResource, $filter, DocumentResource, WorkflowResource, $stateParams) {
	
	this.subscribe = function(item) {
		var deferred = $q.defer();
        if(angular.isDefined(item.id)) {
        	var title = item.name;
        	DocumentsResource.addFav({id: item.id}, 
        		function(response) {
        			$rootScope.$DetailService.metadata.operations.can_subscribe = false;
      		  		var message = $filter('translate')("message.document.fav.subscribe");
        			$rootScope.$AuditService.addAuditItem('success', title, message, undefined, undefined);
        		}, function(error) {
        			$rootScope.$MessageService.writeException(error);
        	});			
        }
	};
        		
	this.unsubscribe = function(item) {
        var deferred = $q.defer();
        if(angular.isDefined(item.id)) {
        	var title = item.name;
        	DocumentsResource.removeFav({id: item.id}, 
        		function(response) {
        			$rootScope.$DetailService.metadata.operations.can_subscribe = true;
      		  		var message = $filter('translate')("message.document.fav.unsubscribe");
        			$rootScope.$AuditService.addAuditItem('success', title, message, undefined, undefined);
        		}, function(error) {
        			$rootScope.$MessageService.writeException(error);
        	});			
        }
	};
	
	this.deleteDocument = function (item) {
        var deferred = $q.defer();
        if(angular.isDefined(item.id)) {
        	$rootScope.setLoader('loader.operation.delete');
        	DocumentsResource.deleteDocument({id: item.id}, 
        		function(response) {
        			var title = $filter('translate')('message.document.delete.title');
       		 		var message = $filter('translate')('message.document.delete.success');
       		 		$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);
        			$state.go($state.current, {}, {reload: true});
        		}, function(error) {
        			$rootScope.$MessageService.writeException(error);
        	});
        }
    };
    
    this.deleteGroup = function (array, index) {
        var deferred = $q.defer();
        if(angular.isUndefined(index)) {index = 0;}
        if(index < array.length) {
        	var item = array[index];
        	$rootScope.setLoader('loader.operation.delete');
        	DocumentsResource.deleteDocument({id: item.id}, 
        		function(response) {
        			if(index == array.length-1) {
        				var title = $filter('translate')('message.document.delete.title');
        				var message = $filter('translate')('message.document.delete.success');
        				$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);
        				$state.go($state.current, {}, {reload: true});        				
        			}
        			index++;
        			$rootScope.$DocumentOperationService.deleteGroup(array, index);
        		}, function(error) {
        			$rootScope.$MessageService.writeException(error);
        	});
        }
    };
    
    this.powerpromote = function(item) {
    	 var deferred = $q.defer();
    	 if(angular.isDefined(item)) {
    		$rootScope.setLoader('loader.operation.powerpromote');
    		$rootScope.overlayClass = 'loader';
    		DocumentResource.documentPowerPromote({documentId: item.id},
                function (response) {
           		 	var title = $filter('translate')('message.document.powerpromote.title');
           		 	var message = $filter('translate')('message.document.powerpromote.success');
           		 	$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);
           		 	$state.go($state.current, {}, {reload: true});
           	 	}, function (error) {
           		 	$rootScope.$MessageService.writeException(error);
             });
    	}
    };
    
    this.powerpromoteGroup = function (array, index) {
        var deferred = $q.defer();
        if(angular.isUndefined(index)) {index = 0;}
        if(index < array.length) {
        	var item = array[index];
        	$rootScope.setLoader('loader.operation.powerpromote');
        	$rootScope.overlayClass = 'loader';
        	DocumentResource.documentPowerPromote({documentId: item.id},
        		function(response) {
        			if(index == array.length-1) {
        				var title = $filter('translate')('message.document.powerpromote.title');
               		 	var message = $filter('translate')('message.document.powerpromote.success');
               		 	$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);
               		 	$state.go($state.current, {}, {reload: true});
        			}
        			index++;
        			$rootScope.$DocumentOperationService.powerpromoteGroup(array, index);
        		}, function(error) {
        			$rootScope.$MessageService.writeException(error);
        	});
        }
    };
    
    this.createWorkflow = function(workflow) {
    	 var deferred = $q.defer();
    	 if(angular.isDefined(workflow)) {
    		WorkflowResource.createWorkflow(workflow, function (response) {
    			var title = $filter('translate')('message.workflow.create.title');
    			var message = $filter('translate')('message.workflow.create.success');
    			$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);
    			$rootScope.$ListService.replaceItems(workflow.documents);
    		}, function (error) {
    			$rootScope.$MessageService.writeException(error);
    		});
    	}
    };
    
    this.duplicate = function(item, metadata) {
    	 var deferred = $q.defer();
    	 if(angular.isDefined(item.id)) {
    		$rootScope.setLoader('loader.operation.duplicate');
    		DocumentResource.documentDuplicate({documentId: item.id}, metadata,
                function (response) {

					DocumentResource.documentCancelCheckout({documentId: response.id},
						function (response2) {

							var title = $filter('translate')('message.document.duplicate.title');
							var message = $filter('translate')('message.document.duplicate.success');
							$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);
							$state.go($state.current, {}, {reload: true});

						}, function (error) {
							$rootScope.$MessageService.writeException(error);
						});

           	 	}, function (error) {
        			$rootScope.$MessageService.writeException(error);
           	 });
    	}
    };
    
    this.addLanguageVersion = function(item, language) {
    	var deferred = $q.defer();
        if(angular.isUndefined(language) || language == '') {
    		var title = item.name;
    		var message = $filter('translate')('message.document.addlang.empty');
    		$rootScope.$MessageService.writeWarning(title, message, undefined, undefined);
    		return;
    	}
    	if(angular.isDefined(item.id)) {
    		var title = item.name;
    		$rootScope.setLoader('loader.operation.addlang');
    		DocumentsResource.addLangVersion({id: item.id, lang: language}, 
    			function (response) {
    				var title = $filter('translate')('message.document.addlang.title');
   		 			var message = $filter('translate')('message.document.addlang.success');
   		 			$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);
    				$state.go($state.current, {}, {reload: true});
    			}, function (error) {
    				$rootScope.$MessageService.writeException(error);
    		});
    	}
    };
    
    this.addLanguageVersionGroup = function (array, language, index) {
        var deferred = $q.defer();
        if(angular.isUndefined(language) || language == '') {
    		var title = item.name;
    		var message = $filter('translate')('message.document.addlang.empty');
    		$rootScope.$MessageService.writeWarning(title, message, undefined, undefined);
    		return;
    	}
        if(angular.isUndefined(index)) {index = 0;}
        if(index < array.length) {
        	var item = array[index];
        	$rootScope.overlayClass = "loader";
    		$rootScope.setLoader('loader.operation.addlang');
        	DocumentsResource.addLangVersion({id: item.id, lang: language}, 
        		function(response) {
        			if(index == array.length-1) {	
        				var title = $filter('translate')('message.document.addlang.title');
       		 			var message = $filter('translate')('message.document.addlang.success');
       		 			$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);
               		 	$state.go($state.current, {}, {reload: true});
        			}
        			index++;
        			$rootScope.$DocumentOperationService.addLanguageVersionGroup(array, language, index);
        		}, function(error) {
        			$rootScope.$MessageService.writeException(error);
        	});
        }
    };
    
    this.unlock = function(item) {
    	var deferred = $q.defer();
    	if(angular.isDefined(item.id)) {
    		$rootScope.overlayClass = "loader";
    		$rootScope.setLoader('loader.operation.unlock');
        	DocumentResource.documentCancelCheckout({documentId: item.id}, 
        		function (response) {
        			$rootScope.$ListService.replaceItem(item);
            	}, function (error) {
            		$rootScope.$MessageService.writeException(error);
            });
    	}
    };
    
    this.unlockGroup = function (array, index) {
        var deferred = $q.defer();
        if(angular.isUndefined(index)) {index = 0;}
        if(index < array.length) {
        	var item = array[index];
        	$rootScope.overlayClass = "loader";
        	$rootScope.setLoader('loader.operation.unlock');
        	DocumentResource.documentCancelCheckout({documentId: item.id}, 
        		function(response) {
        			if(index == array.length-1) {
               		 	$state.go($state.current, {}, {reload: true});
        			}
        			index++;
        			$rootScope.$DocumentOperationService.unlockGroup(array, index);
        		}, function(error) {
        			$rootScope.$MessageService.writeException(error);
        	});
        }
    };
    
    this.newVersion = function(post) {
    	var deferred = $q.defer();
    	if(angular.isDefined(post)) {
    		$rootScope.overlayClass = 'loader';
        	DocumentsResource.newVersion({}, post,
        		function (response) {

					if (angular.isUndefined(response.data)) {
						DocumentResource.documentCancelCheckout({documentId: response.id},
							function (res) {

								var title = $filter('translate')('message.document.newversion.title');
								var message = $filter('translate')('message.document.newversion.success');
								$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);


								//$rootScope.loadRelations();
								$state.go($state.current, {}, {reload: true});
							}, function (error) {
								$rootScope.$MessageService.writeException(error);
							});
					}
					else {
						angular.forEach(response.data, function(value, key) {
							DocumentResource.documentCancelCheckout({documentId: value.id},
								function (res) {

									var title = $filter('translate')('message.document.newversion.title');
									var message = $filter('translate')('message.document.newversion.success');
									$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);

								}, function (error) {
									$rootScope.$MessageService.writeException(error);
								});
						});
						$state.go($state.current, {}, {reload: true});
					}


            	}, function (error) {
            		$rootScope.$MessageService.writeException(error);
            });
    	}
    };
    
    this.newMajorVersion = function(post, id) {
    	var deferred = $q.defer();
    	if(angular.isDefined(post) && angular.isDefined(id)) {
    		post.id = id;
    		$rootScope.overlayClass = 'loader';
    		$rootScope.setLoader('loader.operation.major');
        	DocumentResource.ruleMajorVersion({}, post,
        		function (response) {
        			var title = $filter('translate')('message.document.majorversion.title');
       		 		var message = $filter('translate')('message.document.majorversion.success');
       		 		$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);
       		 		$state.go('document', {tab: 'Metadata', documentId: response.id});
            	}, function (error) {
            		$rootScope.$MessageService.writeException(error);
            });
    	}
    };
    
    this.newCancelVersion = function(post, id) {
    	var deferred = $q.defer();
    	if(angular.isDefined(post) && angular.isDefined(id)) {
    		post.id = id;
    		$rootScope.overlayClass = 'loader';
    		$rootScope.setLoader('loader.operation.minor');
        	DocumentResource.ruleCancelVersion({}, post,
        		function (response) {
        			var title = $filter('translate')('message.document.cancelversion.title');
       		 		var message = $filter('translate')('message.document.cancelversion.success');
       		 		$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);
       		 		$state.go('document', {tab: 'Metadata', documentId: response.id});
            	}, function (error) {
            		$rootScope.$MessageService.writeException(error);
            });
    	}
    };
    
    this.ruleProtocol = function(id) {
    	var deferred = $q.defer();
    	if(angular.isDefined(id)) {
    		DocumentResource.ruleProtocol({id: id},
    		function (response) {
    			deferred.resolve(response);
    		}, function (error) {
    			if(error.status != 400) {
					$rootScope.$MessageService.writeException(error);
				}
    			deferred.reject(error);
    		});    		
    	}
    	return deferred.promise;
    };
    
    this.createRuleProtocol = function(id) {
    	var deferred = $q.defer();
    	if(angular.isDefined(id)) {
    		$rootScope.setLoader('loader.operation.protocol');
    		DocumentResource.ruleProtocolCreate({id: id},
    		function (response) {
    			var title = $filter('translate')('message.document.rule.protocol.title');
    			var message = $filter('translate')('message.document.rule.protocol.create.success');
    			$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);
    			deferred.resolve(response);
    		}, function (error) {
    			$rootScope.$MessageService.writeException(error);
    			deferred.reject(error);
    		});
    		return deferred.promise;
    	}
    };
    
    this.deleteRuleProtocol = function(id) {
    	var deferred = $q.defer();
    	if(angular.isDefined(id)) {
    		DocumentResource.ruleProtocolDelete({id: id},
    		function (response) {
    			var title = $filter('translate')('message.document.rule.protocol.title');
    			var message = $filter('translate')('message.document.rule.protocol.delete.success');
    			$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);
    			$state.go($state.current, {}, {reload: true});
    		}, function (error) {
    			$rootScope.$MessageService.writeException(error);
    		});    		
    	}
    };
    
    this.attachRuleProtocol = function(item, selectedItem, protocolId) {
    	if(angular.isDefined(selectedItem) && angular.isDefined(protocolId)) {
    		DocumentResource.attachProtocol({ruleId: selectedItem.id, protocolId: protocolId},
    		function (response) {
    			$rootScope.$InboxOperationService.addAttachment(item, {"attachmentIds": [selectedItem.id]});
    		}, function (error) {
    			$rootScope.$MessageService.writeException(error);
    		});
    	}
    };

	this.addToProtocol = function(ruleId, protocolId) {
		if(angular.isDefined(ruleId) && angular.isDefined(protocolId)) {
			DocumentResource.addToProtocol({ruleId: ruleId, protocolId: protocolId},
				function (response) {
					//$rootScope.$InboxOperationService.addAttachment(item, {"attachmentIds": [selectedItem.id]});
				}, function (error) {
					//$rootScope.$MessageService.writeException(error);
				});
		}
	};
    
    
    this.expire = function(item) {
    	var deferred = $q.defer();
    	if(angular.isDefined(item.id)) {
    		$rootScope.setLoader('loader.operation.expire');

        	DocumentResource.documentExpire({documentId: item.id}, 
        		function (response) {
        			var title = $filter('translate')('message.document.expire.title');
       		 		var message = $filter('translate')('message.document.expire.success');
       		 		$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);

       		 		//$state.go($state.current, {}, {reload: true});
					$rootScope.$DetailService.detail = undefined;
					$rootScope.$ListService.removeItem(item);

            	}, function (error) {
            		$rootScope.$MessageService.writeException(error);
            });
    	}
    };
    
    this.expireGroup = function (array, index) {
        if(angular.isUndefined(index)) {index = 0;}
        if(index < array.length) {
        	var item = array[index];
    		$rootScope.setLoader('loader.operation.expire');
        	DocumentResource.documentExpire({documentId: item.id}, 
        		function(response) {

					$rootScope.$ListService.removeItem(item);
        			if(index == array.length-1) {

						$rootScope.$ListService.clearMultiselect();

        				var title = $filter('translate')('message.document.expire.title');
               		 	var message = $filter('translate')('message.document.expire.success');
               		 	$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);

        			}
        			index++;
        			$rootScope.$DocumentOperationService.expireGroup(array, index);
        		}, function(error) {
        			$rootScope.$MessageService.writeException(error);
        	});
        }
    };
    
    
}])

.service('InboxOperationService', ['$q', '$rootScope', '$state', 'DocumentsResource', 'WorkflowResource', '$filter',
        function ($q, $rootScope, $state, DocumentsResource, WorkflowResource, $filter) {
	
	this.acquire = function(item) {
		var deferred = $q.defer();
		if(item.item_id) {
			var title = item.wfname;
			DocumentsResource.workflowOperation({ workflowId: item.item_id, operation: 'acquire' },
				function(response) {
					$rootScope.$InboxService.replaceTask(item);
				}, function(error) {
					$rootScope.$MessageService.writeException(error);
			});
		}
	};
	
	this.removeAttachment = function(itemsId) {
		var deferred = $q.defer();
		if(angular.isDefined(itemsId)) {
			DocumentsResource.removeAttachment({ workflowId: $rootScope.$InboxDetailService.detail.item_id }, itemsId,
			function(response) {
				var title = $filter('translate')('message.workflow.removeattachment.title');
       		 	var message = $filter('translate')('message.workflow.removeattachment.success');
       		 	$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);
				$state.go($state.current, {taskId: $rootScope.$InboxDetailService.detail.item_id}, {reload: true});
			}, function(error) {
				$rootScope.$MessageService.writeException(error);
			});
		}
	};
	
	this.addNote = function (item, note) {
		var deferred = $q.defer();
		if(item.id && angular.isDefined(note) && note != '') {
			var title = item.wfname;
			DocumentsResource.workflowOperation({ workflowId: item.item_id, operation: 'addNote' }, { newNoteText: note, newNotePersistent: false },
				function(response) {
					$rootScope.$InboxDetailService.reloadDetail(true);

					deferred.resolve(response);
				}, function(error) {
					$rootScope.$MessageService.writeException(error);

					deferred.reject(error);
			});
		}

		return deferred.promise;
    };
    
    this.finish = function(item) {
    	if(item.id) {
			var title = item.wfname;
			DocumentsResource.workflowOperation({ workflowId: item.item_id, operation: 'finish' }, {},
    			function(response) {
					var title = $filter('translate')('message.workflow.finish.title');
       		 		var message = $filter('translate')('message.workflow.finish.success');
       		 		$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);

					$state.go($state.current, {taskId: undefined}, {reload: true});
    			}, function(error) {
    				$rootScope.$MessageService.writeException(error);
    		});
    	}
    };

	this.finish_back = function(item) {
    	if(item.id) {
			var title = item.wfname;
			DocumentsResource.workflowOperation({ workflowId: item.item_id, operation: 'finish_back' }, {},
    			function(response) {
					var title = $filter('translate')('message.workflow.finish_back.title');
       		 		var message = $filter('translate')('message.workflow.finish_back.success');
       		 		$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);

					$state.go($state.current, {taskId: undefined}, {reload: true});
    			}, function(error) {
    				$rootScope.$MessageService.writeException(error);
    		});
    	}
    };
    
    this.abort = function(item) {
    	if(item.id) {
			var title = item.wfname;
			DocumentsResource.workflowAbort({ workflowId: item.router_id }, {},
    			function(response) {
					var title = $filter('translate')('message.workflow.abort.title');
   		 			var message = $filter('translate')('message.workflow.abort.success');
   		 			$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);
   		 			$rootScope.$InboxService.replaceTask(item);
    			}, function(error) {
    				$rootScope.$MessageService.writeException(error);
    		});
    	}
    };
    
    this.reject = function(item) {
    	if(item.id) {
			var title = item.wfname;
			DocumentsResource.workflowOperation({ workflowId: item.item_id, operation: 'reject' }, {},
    			function(response) {
					var title = $filter('translate')('message.workflow.reject.title');
		 			var message = $filter('translate')('message.workflow.reject.success');
		 			$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);

					$state.go($state.current, {taskId: undefined}, {reload: true});
    			}, function(error) {
    				$rootScope.$MessageService.writeException(error);
    		});
    	}
    };
    
    this.reset = function(item) {
    	if(item.id) {
			var title = item.wfname;
			DocumentsResource.workflowReset({ workflowId: item.router_id }, {},
    			function(response) {
					var title = $filter('translate')('message.workflow.reset.title');
					var message = $filter('translate')('message.workflow.reset.success');
					$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);
					$rootScope.$InboxService.replaceTask(item);
    			}, function(error) {
    				$rootScope.$MessageService.writeException(error);
    		});
    	}
    };
    
    this.resume = function(item) {
    	if(item.id) {
			var title = item.wfname;
			DocumentsResource.workflowOperation({ workflowId: item.item_id, operation: 'resume' }, {},
    			function(response) {
					$rootScope.$InboxService.replaceTask(item);
    			}, function(error) {
    				$rootScope.$MessageService.writeException(error);
    		});
    	}
    };
    
    this.addAttachment = function(item, documents) {
    	if(item.item_id) {
			DocumentsResource.addAttachment({ workflowId: item.item_id }, documents,
			function(response) {

				if (angular.isDefined(item.wfname)) {
					var title = $filter('translate')('message.workflow.addattachment.title');
					var message = $filter('translate')('message.workflow.addattachment.success');
				}
				else {
					var title = $filter('translate')('message.document.addattachment.title');
					var message = $filter('translate')('message.document.addattachment.success');
				}
				$rootScope.$MessageService.writeSuccess(title, message, undefined, undefined);						  
				$state.go($state.current, {taskId: item.item_id}, {reload: true});
			}, function(error) {
				$rootScope.$MessageService.writeException(error);
			});
    	}
    };




			this.delegate = function(item, redaction, note) {
    	if(item.id && angular.isDefined(redaction)) {
			var title = item.wfname;
			if(angular.isDefined(note) && note != '') {
				DocumentsResource.workflowOperation({ workflowId: item.item_id, operation: 'addNote' }, { newNoteText: note, newNotePersistent: false },
					function(response) {
						WorkflowResource.delegate({ id: item.item_id, role: redaction.value },
							function(response) {
								$rootScope.$InboxService.replaceTask(item);
							}, function(error) {
								$rootScope.$MessageService.writeException(error);
						}); 
					}, function(error) {
					$rootScope.$MessageService.writeException(error);
				});
			} else {
				WorkflowResource.delegate({ id: item.item_id, role: redaction.value },
				function(response) {
					$rootScope.$InboxService.replaceTask(item);
				}, function(error) {
					$rootScope.$MessageService.writeException(error);
				}); 
			} 
    	}
    }
    
	
}]);