angular.module('app-resources', ['ngResource'])

	.factory('DocumentsResource', [ '$resource', 'wcmConfig', '$rootScope', function($resource, wcmConfig, $rootScope) {
		return $resource(wcmConfig.backend + '?id=:operation&page=:page&size=:size&sort=[{"property":":sortBy","direction":":direction"}]&filter=:filter', null, {
			list: {method: 'GET', 
				params: {
					operation: '@operation',
					page: '@page',
					size: '@size',
					sort: '@sortBy',
					direction: '@direction',
					filter: '@filter'
				},
				transformResponse: function (data) {
					var array = [];
					var resp = JSON.parse(data);
					if(resp.data) {
						array = resp.data;
					} else if(!_.isArray(resp)) {
						array = [resp];
					}
					return {data: array, total: array.length}
				}},
			inboxList: {method: 'GET', 
				url: wcmConfig.backend + '?id=inbox_tasks&limit=100&sort=[{"property":":sortBy","direction":":direction"}&filter=:filter]',
				params: {
					sort: '@sortBy',
					direction: '@direction',
					filter: '@filter'
				},
				transformResponse: function (data) {
					var array = [];
					var resp = JSON.parse(data);
					if(resp.data) {
						array = resp.data;
					} else if(!_.isArray(resp)) {
						array = [resp];
					}
					return {data: array, total: array.length}
				}
			},
			count: {method: 'GET', url: wcmConfig.backend + '?id=:operation', params: {operation: '@operation'}},
			limit: {method: 'GET', 
				url: wcmConfig.backend + '?id=:operation&limit=:limit&sort=[{"property":":sortBy","direction":":direction"}]',
				params: {
					operation: '@operation',
					sort: '@sortBy',
					direction: '@direction'
				}},
			docPreview: {method: 'GET', url: wcmConfig.backend + '?id=doc_preview&params=:id', params: {id: '@id'},
				transformResponse: function (data) {
					var resp = JSON.parse(data);
					return resp;
				}},
			rulePreview: {method: 'GET', url: wcmConfig.backend + '?id=rule_preview&params=:id', params: {id: '@id'},
				transformResponse: function (data) {
					var resp = JSON.parse(data);
					return resp;
				}},
			favFolders: {method: 'GET', url: wcmConfig.backend + '?id=subscriptions_folders'},
			search: {method: 'GET', url: wcmConfig.backend + '?id=:searchApi&params=:searchString&page=:page&size=:size&sort=[{"property":":sortBy","direction":":direction"}]&filter=:filter',
				params: {
					searchString: '@searchString',
					page: '@page', 
					size: '@size',
					sort: '@sortBy',
					direction: '@direction',
					filter: '@filter',
					searchApi: '@searchApi'
				}},
			advancedSearchConfs : {
				method: 'GET',
				url: wcmConfig.backend + 'configurations/wcm_advanced_search'
			},
			advancedSearchConf : {
				method: 'GET',
				url: wcmConfig.backend + 'configurations/advancedsearch/:conf/template',
				params: {conf: '@conf'}
			},
			advancedSearchParams : {
				method: 'GET',
				url: wcmConfig.backend + '?id=advanced_search&params=:params',
				params: {params: '@params'}
			},
			advancedSearchPost : {
				method: 'GET',
				url: wcmConfig.backend + '?id=advanced_search&params=:params&filter=:filter&page=:page&size=:size&sort=[{"property":":sortBy","direction":":direction"}]',
				params: {
					params: '@params',
					filter: '@filter',
					page: '@page',
					size: '@size',
					sort: '@sortBy',
					direction: '@direction'
					}
			},
			webcabinetsFolders: {method: 'GET', url: wcmConfig.backend + '?id=cabinet_folders&params=:folderId',//&page=:page&size=:size&sort=[{"property":":sortBy","direction":":direction"}]', 
				params: {
					folderId: '@folderId'
					//page: '@page',
					//size: '@size',
					//sort: '@sortBy',
					//direction: '@direction'
				},
				transformResponse: function (data) {
					var array = [];
					var resp = JSON.parse(data);
					if(resp.data) {
						array = resp.data;
					} else if(!_.isArray(resp)) {
						array = [resp];
					}
					return {data: array, total: array.length}
				}},
			webcabinetsFiles: {method: 'GET', url: wcmConfig.backend + '?id=:operation&params=:folderId&page=:page&size=:size&sort=[{"property":":sortBy","direction":":direction"}]&filter=:filter',
					params: {
						operation: '@operation',
						folderId: '@folderId',
						page: '@page',
						size: '@size',
						sort: '@sortBy',
						direction: '@direction',
						filter: '@filter'
					},
					transformResponse: function (data) {
						var array = [];
						var resp = JSON.parse(data);
						if(resp.data) {
							array = resp.data;
						} else if(!_.isArray(resp)) {
							array = [resp];
						}
						return {data: array, total: array.length}
					}},
			webcabinetsRoot: {method: 'GET', url: wcmConfig.backend + '?id=user_cabinets', 
				params: {}},
			favFolder: {method: 'GET', url: wcmConfig.backend + '?id=folder_subscription&params=:path', 
					params: {path:'@path'}},
			addLangVersion:  {method: 'POST', url: wcmConfig.backend + 'documents/:id/langs/:lang', params: {id: '@id', lang: '@lang'}},
			deleteDocument:  {method: 'DELETE', url: wcmConfig.backend + 'documents/:id', params: {id: '@id'}},
			newVersion: {method: 'POST', url: wcmConfig.backend + 'documents/checkin', params: {}},
			removeFav:  {method: 'DELETE', url: wcmConfig.backend + 'documents/:id/favourites', params: {id: '@id'}},
			addFav:  {method: 'POST', url: wcmConfig.backend + 'documents/:id/favourites', params: {id: '@id'}},
			workflowDocuments:  {method: 'GET', url: wcmConfig.backend + '?id=workflow_documents&params=:workflowId', params: {workflowId: '@workflowId'}},
			workflowNotes:  {method: 'GET', url: wcmConfig.backend + '?id=workflow_notes&params=:workflowId', params: {workflowId: '@workflowId'}},
			workflow: {method: 'GET', url: wcmConfig.backend + 'workflows/:id', params: {id: '@id'}},
			workflowOperation: {method: 'POST', url: wcmConfig.backend + 'tasks/:workflowId/:operation', params: {workflowId: '@workflowId', operation: '@operation'}},
			workflowReset: {method: 'POST', url: wcmConfig.backend + 'workflows/:workflowId/restartfailedactivityinworkflow', params: {workflowId: '@workflowId'}},
			workflowAbort: {method: 'POST', url: wcmConfig.backend + 'workflows/:workflowId/abort', params: {workflowId: '@workflowId'}},
			checkObjectName: {method: 'GET', url: wcmConfig.backend + 'validators/uniquobjectname/:name', params: {name: '@name'} },
			validateUniqueObjectName: {method: 'GET', url: wcmConfig.backend + ':url/:name/:id', params: {url: '@url', name: '@name', id: '@id'} },
			validateUniqueProduct: {method: 'GET', url: wcmConfig.backend + ':url/:productId/:documentId', params: {url: '@url', productId: '@productId', documentId: '@documentId'} },

			addAttachment : {method: 'POST', url: wcmConfig.backend + 'tasks/:workflowId/addAttachment', params: {workflowId: '@workflowId'}},
			removeAttachment : {method: 'POST', url: wcmConfig.backend + 'tasks/:workflowId/removeAttachment', params: {workflowId: '@workflowId'}},
			folderFav: {method: 'GET', url: wcmConfig.backend + '?id=folder_subscription&params=:path', params: {path: '@path'}},
			reports: {method: 'GET', url: wcmConfig.backend + '?id=:id', params: { id: '@id' }}
		});
	}])
    .factory('CodeTablesResource', [ '$resource', 'wcmConfig', function($resource, wcmConfig) {
      return $resource(wcmConfig.backend + 'codetables/:codetable/:nodes/:id', null, {
		  list: {method: 'GET', 
			  params: {
				  codetable: '@codetable',
				  id: '@id',
				  nodes: '@nodes'}
		  	  },
		  modifiedlist: {
			  url: wcmConfig.backend + 'codetables/:codetable/modifiednodes/:id',
			  method: 'GET', 
			  params: {
				  codetable: '@codetable',
				  id: '@id'
			  	},
			  transformResponse: function (data) {
					var array = [];
					var resp = JSON.parse(data);
					if(resp.data) {
						array = resp.data;
					} else if(!_.isArray(resp)) {
						array = [resp];
					}
					return {data: array, total: array.length}
			  }
		  },
		  detail: {method: 'GET', url: wcmConfig.backend + 'codetables/:codetable/:id',
			  params: {
				  codetable: '@codetable',
				  id: '@id'
			  }},
		  codebook: {method: 'GET', url: wcmConfig.backend + 'codetables/:codetable', //:id',
        	params: {
				codetable: '@codetable'//,
				//id: '@id'
			}},
		  listAll: {
			  method: 'GET',
			  url: wcmConfig.backend + ':operation',
			  params : {
				  operation: '@operation'
			  }
		  },
		  codetableDetailForm: {method: 'GET', url: wcmConfig.backend + 'configurations/codetables/:codetable/:id',
			  params: {
				  codetable: '@codetable',
				  id: '@id'
			  }},
		  codetableCheckout: {method: 'POST', url: wcmConfig.backend + 'codetables/:codetable/checkout',
			  params: {
				  codetable: '@codetable'
			  }},
		  codetableCheckin: {method: 'POST', url: wcmConfig.backend + 'codetables/:codetable/checkin?forceminor=:forceminor',
			  params: {
				  codetable: '@codetable',
				  forceminor: '@forceminor'
			  }},
		  codetableUnyellow: {method: 'POST', url: wcmConfig.backend + 'codetables/:codetable/unyellow',
			  params: {
				  codetable: '@codetable'
			  }},
		   codetableCancelCheckout: {method: 'POST', url: wcmConfig.backend + 'codetables/:codetable/cancelcheckout',
				  params: {
					  codetable: '@codetable'
				  }},
			codetableCreate : {
				method: 'POST',
				url: wcmConfig.backend + 'codetables/:codetable',
				params: {
					codetable: '@codetable'
				}
			},
			codetableEdit : {
				method: 'PUT',
				url: wcmConfig.backend + 'codetables/:codetable/:id',
				params: {
					codetable: '@codetable',
					id: '@id'
				}
			},
			codetableDelete : {
				method: 'DELETE',
				url: wcmConfig.backend + 'codetables/:codetable/:id',
				params: {
					codetable: '@codetable',
					id: '@id'
				}
			},
			tarifPreview : {
				method: 'GET',
				url: wcmConfig.backend + 'loc/:codetable/preview',
				params: {
					codetable: '@codetable'
				},
				transformResponse: function (data) {
					return {document: data}
				}
			},
			tarifForm : {
				method: 'GET',
				url: wcmConfig.backend + 'configurations/cms_loc_product/cms_loc_product/:portal',
				params: {
					portal: '@portal'
				}
			},
		  	minormajor : {
				method: 'GET',
				url: wcmConfig.backend + 'codetables/:codetable/minormajor',
				params: {
					codetable: '@codetable'
				}
			},
			getModifiedRecords : {
				method: 'GET',
				url: wcmConfig.backend + 'codetables/:codetable/modifiedrecords',
				params: {
					codetable: '@codetable'
				},
				transformResponse: function (data) {
					var array = [];
					var resp = JSON.parse(data);
					if(resp.data) {
						array = resp.data;
					} else if(!_.isArray(resp)) {
						array = [resp];
					}
					return {data: array, total: array.length}
				}
			},
			  configuration : {
				  method: 'GET',
				  url: wcmConfig.backend + 'configurations/editor/ckeditor/conf',
				  transformResponse: function (data) {

					  data = data.replace(new RegExp(("\"").replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), "");
					  data = data.replace(new RegExp(("\\r\\n").replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), "");
					  return {document: data}
				  }
			  }
      });
    }])
    
    .factory('TarifsResource', [ '$resource', 'wcmConfig', function($resource, wcmConfig) {
      return $resource(wcmConfig.backend + 'loc/:tarif/nodes/:id', null, {
		  list: {method: 'GET', params: {
			  tarif: '@tarif',
			  id: '@id'}},
		  modifiedlist: {
			  url: wcmConfig.backend + 'loc/:tarif/modifiednodes/:id',
			  method: 'GET', 
			  params: {
				  tarif: '@tarif',
				  id: '@id'
			  	}
		  },
		  detail: {method: 'GET', url: wcmConfig.backend + 'loc/:tarif/:id',
			  params: {
				  tarif: '@tarif',
				  id: '@id'
			  }},
		  tarif: {method: 'GET', url: wcmConfig.backend + 'loc/:tarif', //:id',
        	params: {
        		tarif: '@tarif'//,
				//id: '@id'
			}},
		  listAll: {
			  method: 'GET',
			  url: wcmConfig.backend + 'loc'
		  },
		  tarifDetailForm: {method: 'GET', url: wcmConfig.backend + 'configurations/loc/:tarif/:id',
			  params: {
				  tarif: '@tarif',
				  id: '@id'
			  }},
			tarifCheckout: {method: 'POST', url: wcmConfig.backend + 'loc/:tarif/checkout',
			  params: {
				  tarif: '@tarif'
			  }},
			tarifCheckin: {method: 'POST', url: wcmConfig.backend + 'loc/:tarif/checkin',
			  params: {
				  tarif: '@tarif'
			  }},
			tarifCancelCheckout: {method: 'POST', url: wcmConfig.backend + 'loc/:tarif/cancelcheckout',
				  params: {
					  tarif: '@tarif'
				  }},
			tarifCreate : {
				method: 'POST',
				url: wcmConfig.backend + 'loc/:tarif',
				params: {
					tarif: '@tarif'
				}
			},
			tarifEdit : {
				method: 'PUT',
				url: wcmConfig.backend + 'loc/:tarif/:id',
				params: {
					tarif: '@tarif',
					id: '@id'
				}
			},
			tarifDelete : {
				method: 'DELETE',
				url: wcmConfig.backend + 'loc/:tarif/:id',
				params: {
					tarif: '@tarif',
					id: '@id'
				}
			}
      });
    }])

	.factory('ContentResource', [ '$resource', 'wcmConfig', function($resource, wcmConfig) {
		return $resource(wcmConfig.backend + 'configurations/:code/:type/:portal', null, {
			get: {method: 'GET', params: {
				codetable: '@portal',
				type: '@type',
				code: '@code'
			}},
			getReport : {method: 'GET',
				url: wcmConfig.backend + 'configurations/reports/:code/:type',
				params: {
					type: '@type',
					code: '@code'
				}
			}///?id={ID}&params={hodnoty formuláře}
		});
	}])
	
	.factory('EmailResource', [ '$resource', 'wcmConfig', function($resource, wcmConfig) {
		return $resource(wcmConfig.backend, null, {
			getGroups: {
				method: 'GET', 
				url: wcmConfig.backend + 'configurations/groupemail_groups',
				params: {}
			},
			getEmails: {
				method: 'GET', 
				url: wcmConfig.backend + '?id=email_addresses_of_group&params=:group',
				params: {group: '@group'}
			}
		});
	}])
	
	.factory('CommonResource', [ '$resource', 'wcmConfig', function($resource, wcmConfig) {
		return $resource(wcmConfig.backend, null, {
			filter: {
				method: 'GET', 
				url: wcmConfig.backend + 'configurations/filters',
				params: {}
			}
		});
	}])
	
	.factory('ImportResource', [ '$resource', 'wcmConfig', function($resource, wcmConfig) {
		return $resource(wcmConfig.backend + 'content', null, {
			imageForm : {method: 'GET',
				url: wcmConfig.backend + 'configurations/picture/cms_picture/:portal', //CS_IA,CS_IE'
				params: {name: '@portal'}
			},
			attachementForm : {method: 'GET',
				url: wcmConfig.backend + 'configurations/attachment/cms_attachment/:portal', //CS_IA,CS_IE'
				params: {name: '@portal'}
			},
			baseImageForm : {
				method: 'GET',
				url: wcmConfig.backend + 'configurations/editor/upload/:id',
				params : {
					id: '@id'
				}
			},
			import : {method: 'POST',
				headers:{'Content-Type':undefined},
				url: wcmConfig.backend + 'documents/',
				params: {}
			},
			uniqueName : {method: 'GET',
				url: wcmConfig.backend + 'validators/uniqueobjectname/:name',
				params: {name: '@name'}
			},
			ruleAttachmentForm : {
				method: 'GET',
				url: wcmConfig.backend + 'configurations/rules/attachment/:id',
				params: { id : '@id'}
			}
		});
		
		
	}])

	.factory('DocumentResource', [ '$resource', 'wcmConfig', function($resource, wcmConfig) {
		return $resource(wcmConfig.backend + 'documents/:id/rendition/xml', null, {
			getXML: {
				method: 'GET',
				headers:{'Content-Type':'text/xml'},
				dataType: 'xml',
				isArray: false,
				params: {
					id: '@id'
				}
				,
				transformResponse: function (data) {
					return {list: data}
				}
			},
			getXMLPreview : {
				method: 'GET',
				url: wcmConfig.backend + 'documents/:id/preview/:template',
				isArray: false,
				params: {
					id: '@id',
					template: '@template'
				},
				transformResponse: function (data) {
					return {list: data}
				}
			},
			exportDocument : {
				method: 'GET', 
				url: wcmConfig.backend + 'documents/:id/rendition',
				isArray: false,
				params: {
					id: '@id'
				},
				transformResponse: function (data) {
					return {list: data}
				}
			},
			rtfExportDocument : {
				method: 'POST',
				url: wcmConfig.backend + 'documents/:id/export',
				isArray: false,
				params: {
					id: '@id'
				}
			},
			createDocument : {method: 'POST',
				url: wcmConfig.backend + 'documents',
				params: {}
			},
			putDocument : {method: 'PUT',
				headers:{'Content-Type':undefined},
				url: wcmConfig.backend + 'documents/:documentId',
				params: {
					documentId: '@documentId'
				}
			},
			putDocumentXml : {method: 'PUT',
				headers:{'Content-Type':undefined},
				url: wcmConfig.backend + 'documents/:documentId',
				params: {
					documentId: '@documentId'
				}
				,
				transformRequest: function (data, headersGetter) {
					var formData = new FormData();

					formData.append('content', data.content);

					return formData;
				}
				,
				data: '@data'
			},
			postDocumentXml : {method: 'POST',
				headers:{'Content-Type':undefined},
				url: wcmConfig.backend + 'documents/:documentId/checkin',
				params: {
					documentId: '@documentId'
				}
				,
				transformRequest: function (data, headersGetter) {
					var formData = new FormData();

					formData.append('content', data.content);

					return formData;
				}
				,
				data: '@data'
			},
			previewXml : {method: 'POST',
				headers:{'Content-Type':undefined},
				url: wcmConfig.backend + 'documents/:documentId/preview/:portal',
				params: {
					documentId: '@documentId',
					portal: '@portal'
				},
				transformRequest: function (data, headersGetter) {
					var headerd = headersGetter();
					var formData = new FormData();
					formData.append('content', data.content);
					return formData;
				},
				transformResponse: function (data) {
					return {list: data}
				},
				data: '@data'
			},
			getDocument: {method: 'GET',
				url: wcmConfig.backend + 'documents/:documentId',
				params: {
					documentId: '@documentId'
				}
			},
			getDocumentVersions: {
				method: 'GET',
				url: wcmConfig.backend + 'documents/:documentId/versions',
				params: {
					documentId: '@documentId'
				}
			},
			ruleAttachments: {
				method: 'GET',
				url: wcmConfig.backend + '?id=rule_attachments&params=:ruleId,:languageCode,:ruleVersion',
				params: {
					ruleId: '@ruleId',
					languageCode: '@languageCode',
					ruleVersion: '@ruleVersion'
				},
				transformResponse: function (data) {
					var array = [];
					var resp = JSON.parse(data);
					if(resp.data) {
						array = resp.data;
					} else if(!_.isArray(resp)) {
						array = [resp];
					}
					return {data: array, total: array.length}
				}
			},
			documentCheckout: {
				method: 'POST',
				url: wcmConfig.backend + 'documents/:documentId/checkout',
				params: {
					documentId: '@documentId'
				}
			}
			,
			documentCancelCheckout: {
				method: 'POST',
				url: wcmConfig.backend + 'documents/:documentId/cancelcheckout',
				params: {
					documentId: '@documentId'
				}
			},
			documentPowerPromote: {
				method: 'POST',
				url: wcmConfig.backend + 'documents/:documentId/powerpromote',
				params: {
					documentId: '@documentId'
				}
			},
			documentExpire: {
				method: 'POST',
				url: wcmConfig.backend + 'documents/:documentId/expire',
				params: {
					documentId: '@documentId'
				}
			},
			documentDuplicate: {
				method: 'POST',
				url: wcmConfig.backend + 'documents/:documentId/duplicate',
				params: {
					documentId: '@documentId'
				}
			},
			configurationDuplicate: {
				method: 'GET',
				url: wcmConfig.backend + 'configurations/duplicate/:type/:id',
				params: {
					type: '@type',
					id : '@id'
				}
			},
			contains: {
				method: 'GET',
				url: wcmConfig.backend + '?id=document_contains&params=:documentId',
				params: {
					documentId: '@documentId'
				},
				transformResponse: function (data) {
					var array = [];
					var resp = JSON.parse(data);
					if(resp.data) {
						array = resp.data;
					} else if(!_.isArray(resp)) {
						array = [resp];
					}
					return {data: array, total: array.length}
				}
			},
			contained: {
				method: 'GET',
				url: wcmConfig.backend + '?id=document_containedin&params=:documentId',
				params: {
					documentId: '@documentId'
				},
				transformResponse: function (data) {
					var array = [];
					var resp = JSON.parse(data);
					if(resp.data) {
						array = resp.data;
					} else if(!_.isArray(resp)) {
						array = [resp];
					}
					return {data: array, total: array.length}
				}
			},
			history: {
				method: 'GET',
				url: wcmConfig.backend + '?id=document_history&params=:name',
				params: {
					name: '@name'
				}
			},
			ruleMajorVersionForm : {
				method: 'GET',
				url: wcmConfig.backend + 'configurations/rules/newmajor/:id',
				params: { id : '@id'}
			},
			ruleCancelVersionForm : {
				method: 'GET',
				url: wcmConfig.backend + 'configurations/rules/newcancel/:id',
				params: { id : '@id'}
			},
			ruleMajorVersion : {
				method: 'POST',
				url: wcmConfig.backend + 'rules/newmajor',
				params: {}
			},
			ruleCancelVersion : {
				method: 'POST',
				url: wcmConfig.backend + 'rules/newcancel',
				params: {}
			},
			ruleProtocol : {
				method: 'GET',
				url: wcmConfig.backend + 'rules/:id/protocol',
				params: {id: '@id'}
			},
			ruleProtocolCreate : {
				method: 'POST',
				url: wcmConfig.backend + 'rules/:id/protocol',
				params: {id: '@id'}
			},
			ruleProtocolAttach : {
				method: 'POST',
				url: wcmConfig.backend + 'rules/:id/attach/:protocolId',
				params: {id: '@id', protocolId: '@protocolId'}
			},
			ruleProtocolDelete : {
				method: 'DELETE',
				url: wcmConfig.backend + 'rules/:id/protocol',
				params: {id: '@id'}
			},
			attachProtocol : {
				method: 'POST',
				url: wcmConfig.backend + 'rules/:ruleId/attach/:protocolId',
				params : {
					ruleId: '@ruleId',
					protocolId: '@protocolId'
				}
			},
			addToProtocol : {
				method: 'POST',
				url: wcmConfig.backend + 'rules/:ruleId/protocol/:protocolId',
				params : {
					ruleId: '@ruleId',
					protocolId: '@protocolId'
				}
			}
		});
	}])

	.factory('WorkflowResource', [ '$resource', 'wcmConfig', function($resource, wcmConfig) {
		return $resource(wcmConfig.backend + 'workflows', null, {

			createWorkflow : {method: 'POST',
				url: wcmConfig.backend + 'workflows',
				params: {}
			},
			getDelegateRoles : {
				method: 'GET',
				url: wcmConfig.backend + 'configurations/wcm_delegate_roles'
			},
			delegate : {
				method: 'POST',
				url: wcmConfig.backend + 'tasks/:id/delegate/:role',
				params: {
					role: '@role',
					id: '@id'
				}
			}
		});
	}])

	.factory('LoaderFactory', ['$rootScope', function ($rootScope) {
		
  var urlsWithoutLoader = [{url: ['my_documents'], method: 'GET', is_file: false}, 
                           {url: ['documents'], method: 'PUT', is_file: true},
                           {url: ['content'], method: 'POST', is_file: false}, 
                           {url: ['workflow_documents'], method: 'GET', is_file: false},
                           {url: ['workflow_notes'], method: 'GET', is_file: false},
                           {url: ['favourites'], method: 'POST', is_file: false},
                           {url: ['favourites'], method: 'DELETE', is_file: false},
						  {url: ['powerpromote'], method: 'POST', is_file: false},
						  {url: ['cancelcheckout'], method: 'POST', is_file: false},
						  {url: ['checkout'], method: 'POST', is_file: false},
						  {url: ['document', 'checkin'], method: 'POST', is_file: false},
						  {url: ['count'], method: 'GET', is_file: false}
  ];


  return {

    counter: 0,
    show: function(config) {

    	if(angular.isDefined(config)) {
    		var overlay = _.findWhere(config.overlay, {url: config.url, method: config.method});
    		if(!isHiddenOverlay(urlsWithoutLoader, config) || angular.isDefined(overlay)) {

    			if(overlay != undefined) {
        			$('#' + overlay.id).show();
    			} else {
    				this.counter++;
    				//$rootScope.busy = true;
    				$('#loader').show();
    			}
    		}
    	}
    },

    hide: function(config) {
    	if(angular.isDefined(config)) {
    		var overlay = _.findWhere(config.overlay, {url: config.url, method: config.method});
    		if(!isHiddenOverlay(urlsWithoutLoader, config) || angular.isDefined(overlay)) {
    			if(overlay != undefined) {
        			$('#' + overlay.id).hide();
    			} else if(--this.counter === 0) {
    				//delete $rootScope.busy;
    				$('#loader').hide();    				
    			}
    		}
    	}
    }
  };
}]);

function isHiddenOverlay(urls, config) {
    for(var index=0; index < urls.length; index++) {
        if(urls[index].method == config.method) {
        	var found = true;
        	for(var i = 0; i < urls[index].url.length; i++) {
        		if(found == true) {
        			found = config.url.indexOf(urls[index].url[i]) > -1
        		}
        	}
            if(found) {
				if (!urls[index].is_file || (urls[index].is_file && angular.isDefined(config.data) && angular.isDefined(config.data.content) && config.data.content !== null)) {
					return true
				}

            }
        }
    }
    return false;
}
