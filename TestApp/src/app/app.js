angular.module( 'wcm', [
    'templates-app',
    'templates-common',
    'ngResource',
    'ngAnimate',
    'ui.router',
    //'ui.utils',
    'ui.bootstrap',
    'ui.select',
    'pascalprecht.translate',
    'ng-context-menu',
    'infinite-scroll',
    'ngFileUpload',
    'app-resources',
    'treeControl',
    'ngSanitize',
    'dynamicForm',
    'cb.x2js',
    'ckeditor',
    'templates-common',
    'inbox',
    'document-directives',
    'documents',
    'documents-my',
    'documents-fav',
    'documents-operation-single',
    'documents-operation-group',
    'codebooks',
    'reports',
    'email',
    'dictionary',
    'tarifs',
    'webcabinets',
    'search',
    'import',
    'auth',
    'app-states',
    'common.utility',
	'tmh.dynamicLocale',
	'ngCookies',
	'ui.mask',
	'ngCsv',
	'service-message',
	'service-audit',
	'service-list',
	'service-detail',
	'service-operation',
	'service-modal',
	'wcmtimepicker',
	'diff-match-patch',
	'ngStorage',
	'diff',
	'queryBuilder'
])

    .config(['$stateProvider', '$locationProvider', '$urlRouterProvider', '$httpProvider', '$translateProvider', 'tmhDynamicLocaleProvider',
        function ($stateProvider, $locationProvider, $urlRouterProvider, $httpProvider, $translateProvider, tmhDynamicLocaleProvider) {
    		
    		$urlRouterProvider.otherwise('/dashboard/inbox');
    	
            $httpProvider.interceptors.push(['$q', '$log', '$rootScope', 'LoaderFactory', function($q, $log, $rootScope, LoaderFactory) {
				var realEncodeURIComponent = window.encodeURIComponent;
                return {
                	'request': function(config) {
                		config.headers["Cache-Control"] = "no-cache, must-revalidate";
                    	config.headers["Pragma"] = "no-cache";
                    	//if(angular.isDefined(config.url) && config.url.search('/rest') != -1) {
                    		//console.log('request: ' + config.method + '  ' + config.url);
                    		//console.log('');
                    	//}
                		if(angular.isDefined($rootScope.user)) {
							config.headers["user"] = $rootScope.user;

						} else if(angular.isDefined(configuration) && angular.isDefined(configuration.defUser)) {
							config.headers["user"] = configuration.defUser; //"cms_test6"; // // //"cen78221"; // //
							//$rootScope.initUser = true;
						}

                		if(angular.isDefined($rootScope.lang)) {
                			config.headers["lang"] = $rootScope.lang.object_name;
                		}

                		if($rootScope.overlayClass != undefined) {
                			$rootScope.overlay.push({
                				id : $rootScope.overlayClass,
                				url: config.url,
                				method: config.method
                			});
                			config.overlay = $rootScope.overlay;

                			delete $rootScope.overlayClass;
                		}
                		LoaderFactory.show(config);

						window.encodeURIComponent = function(input) {
							return realEncodeURIComponent(input).split("%2F").join("/");
						};

						return config;
                    },
                    'requestError': function(rejection) {
                    	LoaderFactory.hide();
                        return $q.reject(rejection);
                    },
                    'response': function(response) {
                    	response.config.headers["Cache-Control"] = "no-cache, must-revalidate";
                    	response.config.headers["Pragma"] = "no-cache";
                    	response.config.overlay = $rootScope.overlay;
                    	LoaderFactory.hide(response.config);
                    	$rootScope.overlay = _.without($rootScope.overlay, _.findWhere($rootScope.overlay, {url: response.config.url}));
                    	if(response.status === 204) {
                    		$q.reject(response);
                    	}
                    	//if(angular.isDefined(response.config.url) && response.config.url.search('/rest') != -1) {
                    		//console.log('response: ' + response.status + '  ' + response.config.method + '  ' + response.config.url);
                    		//console.log(response);
                    		//console.log('');
                    	//}
                        return response;
                    },
                    'responseError': function(response) {
                    	if(angular.isDefined(response.config)) {
                    		//if(angular.isDefined(response.config.url) && response.config.url.search('/rest') != -1) {
                    			//console.log('response error: ' + response.status + '  ' + response.config.method + '  ' + response.config.url);
                    			//console.log(response);
                    			//console.log('');
                    		//}
                    		response.config.overlay = $rootScope.overlay;
                    		LoaderFactory.hide(response.config);
                    		$rootScope.overlay = _.without($rootScope.overlay, _.findWhere($rootScope.overlay, {url: response.config.url}));
                    		if(response.status === 401) {
                    			$location.path('/login');
                    			return $q.reject(response);
                    		}
                    	} else {
                    		LoaderFactory.hide();
                    	}
                         return $q.reject(response);
                     }
                };
            }]);
            
            
            $translateProvider.useStaticFilesLoader({
            	prefix: "assets/lang-",
            	suffix: ".json"
            });
            
            $translateProvider.preferredLanguage('cs_CZ');

			tmhDynamicLocaleProvider.localeLocationPattern('vendor/angular-i18n/angular-locale_{{locale}}.js');

            $httpProvider.defaults.useXDomain = true;
            $httpProvider.defaults.withCredentials = true;
            delete $httpProvider.defaults.headers.common["X-Requested-With"];
            $httpProvider.defaults.headers.common["Accept"] = "application/json";
            $httpProvider.defaults.headers.common["Content-Type"] = "application/json";
            
        }])
        
    .constant('wcmConfig', {
		'backend': configuration.backend,
        'docsUrl': configuration.docsUrl,
        'datetimeformat': 'dd. MM. yyyy HH:mm',
        'datetimesecformat': 'dd. MM. yyyy HH:mm:ss',
        'dateformat': 'dd. MM. yyyy',
        'version': configuration.version,
        'msgTimeout' : 7000
    })


	.run(
	['$rootScope', '$state', '$stateParams', 'wcmConfig', 'Auth', '$interval',
		'$window', '$location', '$browser', '$timeout', 'AuthService', 'DocumentsResource',
		'CommonResource', '$filter', '$translate', '$templateCache', 'tmhDynamicLocale', '$cookieStore',
		'MessageService', 'AuditService', 'ListService', 'DetailService', 'FolderOperationService',
		'DocumentOperationService', 'InboxDetailService', 'InboxService', 'InboxOperationService',
		'CodetableListService', 'UploadService', 'CodetableDetailService', 'ModalService', 'CodeTablesResource',
		function ($rootScope, $state, $stateParams, wcmConfig, Auth, $interval,
				  $window, $location, $browser, $timeout, AuthService, DocumentsResource,
				  CommonResource, $filter, $translate, $templateCache, tmhDynamicLocale, $cookieStore,
				  MessageService, AuditService, ListService, DetailService, FolderOperationService,
				  DocumentOperationService, InboxDetailService, InboxService, InboxOperationService,
				  CodetableListService, UploadService, CodetableDetailService, ModalService, CodeTablesResource) {

			$rootScope.cache = {};
			$rootScope.overlay = [];

			$rootScope.$MessageService = MessageService;
			$rootScope.$AuditService = AuditService;
			$rootScope.$ListService = ListService;
			$rootScope.$DetailService = DetailService;
			$rootScope.$FolderOperationService = FolderOperationService;
			$rootScope.$DocumentOperationService = DocumentOperationService;
			$rootScope.$UploadService = UploadService;
			$rootScope.$ModalService = ModalService;

			$rootScope.$CodetableListService = CodetableListService;
			$rootScope.$CodetableDetailService = CodetableDetailService;
			$rootScope.$InboxService = InboxService;
			$rootScope.$InboxDetailService = InboxDetailService;
			$rootScope.$InboxOperationService = InboxOperationService;

			$rootScope.dateOptions = {
				formatYear: 'yy',
				startingDay: 1,
				showWeeks:'false',
				showButtonBar: 'false',
				formatDay: 'd',
				//formatDayHeader: '',
				formatDayTitle: 'MMMM yyyy',
				formatMonth: 'MMMM',
				formatMonthTitle: 'y'
			};

			$rootScope.format = 'dd.MM.yyyy';
			$rootScope.momentFormat = 'DD.MM.YYYY';

			$rootScope.reinit = function() {
				$rootScope.$ListService.reinit();
				$rootScope.$InboxService.reinit();
				$rootScope.$DetailService.reinit();
				$rootScope.$InboxDetailService.reinit();
				$rootScope.$UploadService.reinit();
			};


			$(window).scroll(function(){
				$("#cs-toolbar").css({top: (72 + $(window).scrollTop()) + 'px'});

				$("#cs-toolbar.webcabinets").css({top: (152 + $(window).scrollTop()) + 'px'});

			});

			CodeTablesResource.configuration(function (response) {
				eval(response.document);

				if (angular.isDefined(configurationEditor)) {
					$rootScope.configuration = configurationEditor;
				}
				else {
					//// Editor options.
					$rootScope.configuration = configuration;
				}
			});

    		$rootScope.$state = $state;
    		$rootScope.$stateParams = $stateParams;
    		$rootScope.wcmConfig = wcmConfig;
    		
    		$rootScope.files = [];
    		$rootScope.$watch('files', function () {
    			$rootScope.$UploadService.upload($rootScope.files);
    		});
    		
    		$rootScope.setLoader = function(property) {
    			if(angular.isUndefined(property)) {
    				$rootScope.loaderText = $filter('translate')('loader.default');
					if($rootScope.loaderText === 'loader.default') {
						$rootScope.loaderText = "";
					}
    			} else {
    				$rootScope.loaderText = $filter('translate')(property);
    				if($rootScope.loaderText === property) {
    					$rootScope.loaderText = $filter('translate')('loader.default');
    					if($rootScope.loaderText === 'loader.default') {
    						$rootScope.loaderText = "";
    					}
    				}    				
    			}
    		};
    		
    		$rootScope.getLoaderMessage = function() {
    			if(angular.isUndefined($rootScope.loaderText)) {
    				return '';
    			}
    			return $rootScope.loaderText;
    		};

			$rootScope.lang = {};
            $rootScope.$watch('lang', function () {
            	$translate.use($rootScope.lang.object_name);
				tmhDynamicLocale.set($rootScope.lang.object_name.split('_')[0]).then(function() {
					// Broadcast the event so datepickers would rerender
					$rootScope.$broadcast('localeChanged');
				});
            });

            $rootScope.updateInboxCount = function() {
            	DocumentsResource.count({operation: 'inbox_tasks_count'}, function(response) {
            		$rootScope.inbox_count = response.total_count;
            	});
            };
            
            $rootScope.updateInboxCount();
            
            $rootScope.editorRedirect = function() {
            	if($rootScope.user_name) {
            		if($rootScope.isEditor && $rootScope.is_inbox) {
            			$state.go('dashboard.inbox');  				
            		} else {
            			$state.go('dashboard.my');
            		}            		
            	}
            };
            
            $rootScope.$watch('is_inbox', function() {
            	if(angular.isDefined($rootScope.is_inbox) && angular.isDefined($rootScope.isEditor)) {
            		$rootScope.editorRedirect();
            	}
            });
            
            $rootScope.$watch('isEditor', function() {
            	if(angular.isDefined($rootScope.is_inbox) && angular.isDefined($rootScope.isEditor)) {
            		$rootScope.editorRedirect();
            	}
            });
            
            // SHIFT KEY CHECK
            $rootScope.checkShift = function($event) {
            	if($event.keyCode == 16 && !$rootScope.shifted) {
            		$rootScope.shifted = true;
            	}
            };
            
            $rootScope.checkUnshift = function($event) {
            	if($event.keyCode == 16) {
            		delete $rootScope.shifted;
            	}
            };
           
			if ($rootScope.user === undefined) {
				if (angular.isDefined($cookieStore.get('user'))) {
					$rootScope.user = $cookieStore.get('user');
					$rootScope.lang = $cookieStore.get('lang');
					$rootScope.user_name = $cookieStore.get('user_name');
					$rootScope.roles = $cookieStore.get('roles');
					$rootScope.is_inbox = $cookieStore.get('is_inbox');
					$rootScope.isEditor = $cookieStore.get('isEditor');
				}
				else {
					$state.go('login');
				}
            }
			
			$rootScope.hasRole = function(role) {
				return angular.isDefined(_.findWhere($rootScope.roles, {group_name: role}));
			};
			
			$rootScope.hasCodetables = function() {
				var result = ($rootScope.hasRole('cms_codetable_manager') || 
				$rootScope.hasRole('cms_infobasect_manager') ||
				$rootScope.hasRole('cms_dictionary_manager') ||
				$rootScope.hasRole('cms_kcpcodetable_mgr'))	||
				$rootScope.hasRole('cms_mepct_manager') ||
				$rootScope.hasRole('cms_grgct_manager');
				return result;
			}
			
			$rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {				
				if (fromState.name === 'dashboard.template-select' && toState.name === 'document') { 
			    	$rootScope.replaceURL = true;
			    }
				$window.scrollTo(0,0);			
				
				if(angular.isDefined(fromState) && fromState.name == toState.name && toState.name == 'import') {
					$rootScope.reloadTemplate = true;
				}
			  });
			
            
            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            	if(fromState.name == 'login' && $rootScope.is_inbox == false) {
            		$rootScope.editorRedirect();
            	} else if(toState.name == 'dashboard.inbox' && $rootScope.is_inbox == false) {
            		event.preventDefault();
        			var title = $filter('translate')('system.accessdenied.title');
        			var message = $filter('translate')('system.accessdenied.message') + $filter('translate')(toState.data.pageTitle);;
        			$rootScope.$MessageService.writeError(title, message, undefined, undefined);
        			$rootScope.editorRedirect();
            	}
            	
            	if(toState.name != 'dashboard.search') {
            		delete $rootScope.searchString;
            	}
            	
            	if(angular.isDefined($rootScope.replaceURL) && $rootScope.replaceURL) {
 			    	delete $rootScope.replaceURL;
 			    	$location.path('/dashboard/my').replace();
 			    }
            	if(angular.isUndefined($rootScope.user) && toState.name != 'login') {
            		$state.go('login');
            	} else if(angular.isDefined($rootScope.user) && toState.name == 'login') {
            		$rootScope.editorRedirect();
            	}
            	
            	// roles
            	if(angular.isDefined(toState.data) && angular.isDefined(toState.data.roles)) {
            		var result = false;
            		for(var index = 0; index < toState.data.roles.length; index++) {
            			if(result == false) {
            				if(toState.data.roles[index] == 'editor') {
            					result =  $rootScope.isEditor;
            				} else {
            					result = $rootScope.hasRole(toState.data.roles[index]);
            				}
            			}
            		}
            		if(result == false) {
            			event.preventDefault();
            			var title = $filter('translate')('system.accessdenied.title');
            			var message = $filter('translate')('system.accessdenied.message') + $filter('translate')(toState.data.pageTitle);;
            			$rootScope.$MessageService.writeError(title, message, undefined, undefined);
            			$rootScope.editorRedirect();
            		}
            	}
            	            	
            	if(toState.name == 'document') {
            		$rootScope.prevState = {};
            		if(fromState.name != 'dashboard.template-select' && fromState.name != 'document') {
            			$rootScope.prevState.name = fromState.name;            			
            			$rootScope.prevState.params = fromParams;
            			if(fromState.name == 'dashboard.webcabinets') {
                			$rootScope.prevState.params = {};
                		}
            		}  else {
            			$rootScope.prevState.name = 'dashboard.my';
            		}
            	}

				//if ((fromState.name == 'dashboard.webcabinets' && toState.name !== 'dashboard.webcabinets') || (fromState.name == 'document' && toState.name !== 'dashboard.webcabinets')) {
                //
				//	$rootScope.$DetailService.detail = undefined;
				//	//var det = angular.copy($rootScope.$DetailService.detail);
				//}
                //
				//if ((fromState.name === 'dashboard.inbox' && fromState.name !== 'dashboard.inbox') || (fromState.name === 'document' && fromState.name !== 'dashboard.inbox')) {
				//	$rootScope.$InboxDetailService.detail = undefined;
				//}



				//if ((fromState.name == 'dashboard.webcabinets' && toState.name !== 'dashboard.webcabinets') || (fromState.name == 'document' && toState.name !== 'dashboard.webcabinets')) {
				//	$rootScope.$DetailService.detail;
				//}


				//if (!(fromState.name == 'dashboard.webcabinets') && (toState.name === 'dashboard.webcabinets')) {
				//	$rootScope.$InboxDetailService.detail = undefined;
				//}

				//if ((fromState.name !== 'dashboard.webcabinets') && (fromState.name !== 'document' && toState.name !== 'dashboard.webcabinets') ) {
				//	//$rootScope.$ListService.parents = undefined;
				//	//$rootScope.$ListService.updateCache();
				//	$rootScope.$InboxDetailService.detail = undefined;
				//}
            	
            	$rootScope.setLoader('loader.' + toState.name);
            });

			String.prototype.Blength = function() {
				return encodeURIComponent(this).replace(/%[A-F\d]{2}/g, 'U').length;
			}

            $templateCache.put("wcm/choices.tpl.html",
				"<ul class=\"ui-select-choices ui-select-choices-content dropdown-menu\" role=\"listbox\" ng-show=\"$select.items.length > 0\">" +
				"<li class=\"ui-select-choices-group\" id=\"ui-select-choices-{{ $select.generatedId }}\">" +
				"<div class=\"divider\" ng-show=\"$select.isGrouped && $index > 0\">" +
				"</div>" +
				"<div ng-show=\"$select.isGrouped\" class=\"ui-select-choices-group-label dropdown-header\" ng-bind=\"$group.name\">" +
				"</div>" +
				"<div id=\"ui-select-choices-row-{{ $select.generatedId }}-{{$index}}\" class=\"ui-select-choices-row\" ng-class=\"{active: $select.isActive(this), disabled: $select.isDisabled(this)}\" role=\"option\">" +
				"<a href=\"javascript:void(0)\" class=\"ui-select-choices-row-inner\">" +
				"</a>" +
				"</div>" +
				"</li>" +
				"</ul>");

			$templateCache.put("wcm2/choices.tpl.html",
				"<ul class=\"ui-select-choices ui-select-choices-content dropdown-menu\" role=\"listbox\" ng-show=\"$select.items.length > 0\">" +
				"<li class=\"ui-select-choices-group\" id=\"ui-select-choices-{{ $select.generatedId }}\">" +
				"<div class=\"divider\" ng-show=\"$select.isGrouped && $index > 0\">" +
				"</div>" +
				"<div ng-show=\"$select.isGrouped\" class=\"ui-select-choices-group-label dropdown-header\" ng-bind=\"$group.name\">" +
				"</div>" +
				"<div id=\"ui-select-choices-row-{{ $select.generatedId }}-{{$index}}\" class=\"ui-select-choices-row\" ng-class=\"{active: $select.isActive(this), disabled: $select.isDisabled(this)}\" role=\"option\">" +
				"<a href=\"javascript:void(0)\" class=\"ui-select-choices-row-inner\">" +
				"</a>" +
				"</div>" +
				"</li>" +
				"</ul>");

            $templateCache.put("wcm/match-multiple.tpl.html",
				"<div class=\"ui-select-match\">" +
				"<span ng-repeat=\"$item in $select.selected track by $index\">" +
				"<span class=\"ui-select-match-item btn btn-default btn-xs\" tabindex=\"-1\" type=\"button\" ng-disabled=\"$select.disabled\" ng-click=\"$selectMultiple.activeMatchIndex = $index;\" ng-class=\"{\'btn-primary\':$selectMultiple.activeMatchIndex === $index, \'select-locked\':$select.isLocked(this, $index)}\" ui-select-sort=\"$select.selected\">" +
				"<span class=\"close ui-select-match-close\" ng-hide=\"$select.disabled\" ng-click=\"$selectMultiple.removeChoice($index)\">" +
				"</span> " +
				"<span uis-transclude-append=\"\">" +
				"</span>" +
				"</span>" +
				"</span>" +
				"</div>");

			$templateCache.put("wcm2/match-multiple.tpl.html",
				"<span class=\"ui-select-match\">" +
				"<span ng-repeat=\"$item in $select.selected track by $index\">" +
				"<span class=\"ui-select-match-item btn btn-default btn-xs\" tabindex=\"-1\" type=\"button\" ng-disabled=\"$select.disabled\" ng-click=\"$selectMultiple.activeMatchIndex = $index;\" ng-class=\"{\'btn-primary\':$selectMultiple.activeMatchIndex === $index, \'select-locked\':$select.isLocked(this, $index)}\" ui-select-sort=\"$select.selected\">" +
				"<span class=\"close ui-select-match-close\" ng-hide=\"$select.disabled\" ng-click=\"$selectMultiple.removeChoice($index)\">" +
				"</span> " +
				"<span uis-transclude-append=\"\">" +
				"</span>" +
				"</span>" +
				"</span>" +
				"</span>");

            //$templateCache.put("wcm/match.tpl.html",
				//"<div class=\"ui-select-match\" ng-hide=\"$select.open\" ng-disabled=\"$select.disabled\" ng-class=\"{\'btn-default-focus\':$select.focus}\">" +
				//"<span tabindex=\"-1\" class=\"btn btn-default form-control ui-select-toggle\" aria-label=\"{{ $select.baseTitle }} activate\" ng-disabled=\"$select.disabled\" ng-click=\"$select.activate()\" style=\"outline: 0;\">" +
				//"<span ng-show=\"$select.isEmpty()\" class=\"ui-select-placeholder text-muted\">{{$select.placeholder}}" +
				//"</span> " +
				//"<span ng-hide=\"$select.isEmpty()\" class=\"ui-select-match-text pull-left\" ng-class=\"{\'ui-select-allow-clear\': $select.allowClear && !$select.isEmpty()}\" ng-transclude=\"\">" +
				////ng-transclude=\"\"
				//"</span> " +
            //
				////"<i class=\"caret pull-right\" ng-click=\"$select.toggle($event)\">" +
				////"</i> " +
            //
				//"<a ng-show=\"$select.allowClear && !$select.isEmpty()\" aria-label=\"{{ $select.baseTitle }} clear\" style=\"margin-right: 10px\" ng-click=\"$select.clear($event)\" class=\"btn btn-xs btn-link pull-right\">" +
				//"<i class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\">" +
				//"</i>" +
				//"</a>" +
				//"</span>" +
				//"</div>");

			$templateCache.put("wcm/match.tpl.html",
				"<div class=\"ui-select-match\" ng-hide=\"$select.open\" ng-disabled=\"$select.disabled\" ng-class=\"{\'btn-default-focus\':$select.focus}\">" +
				"<span tabindex=\"-1\" class=\"btn btn-default form-control ui-select-toggle\" aria-label=\"{{ $select.baseTitle }} activate\" ng-disabled=\"$select.disabled\" ng-click=\"$select.activate()\" style=\"outline: 0;\">" +
				"<span ng-show=\"$select.isEmpty()\" class=\"ui-select-placeholder text-muted\">{{$select.placeholder}}" +
				"</span> " +
				"<span ng-hide=\"$select.isEmpty()\" class=\"ui-select-match-text pull-left\" ng-class=\"{\'ui-select-allow-clear\': $select.allowClear && !$select.isEmpty()}\" ng-transclude=\"\">" +
				"</span> " +
				"<i class=\"caret pull-right\" ng-click=\"$select.toggle($event)\">" +
				"</i> " +
				"<a ng-show=\"$select.allowClear && !$select.isEmpty()\" aria-label=\"{{ $select.baseTitle }} clear\" style=\"margin-right: 10px\" ng-click=\"$select.clear($event)\" class=\"btn btn-xs btn-link pull-right\">" +
				"<i class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\">" +
				"</i>" +
				"</a>" +
				"</span>" +
				"</div>");

			$templateCache.put("wcm2/match.tpl.html",
				"<div class=\"ui-select-match\" ng-hide=\"$select.open\" ng-disabled=\"$select.disabled\" ng-class=\"{\'btn-default-focus\':$select.focus}\">" +
				"<span tabindex=\"-1\" class=\"btn btn-default form-control ui-select-toggle\" aria-label=\"{{ $select.baseTitle }} activate\" ng-disabled=\"$select.disabled\" ng-click=\"$select.activate()\" style=\"outline: 0;\">" +
				"<span ng-show=\"$select.isEmpty()\" class=\"ui-select-placeholder text-muted\">{{$select.placeholder}}" +
				"</span> " +
				"<span ng-hide=\"$select.isEmpty()\" class=\"ui-select-match-text pull-left\" ng-class=\"{\'ui-select-allow-clear\': $select.allowClear && !$select.isEmpty()}\" ng-transclude=\"\">" +
				"</span> " +
				"<i class=\"caret pull-right\" ng-click=\"$select.toggle($event)\">" +
				"</i> " +
				"<a ng-show=\"$select.allowClear && !$select.isEmpty()\" aria-label=\"{{ $select.baseTitle }} clear\" style=\"margin-right: 10px\" ng-click=\"$select.clear($event)\" class=\"btn btn-xs btn-link pull-right\">" +
				"<i class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\">" +
				"</i>" +
				"</a>" +
				"</span>" +
				"</div>")

			$templateCache.put("wcm/select-multiple.tpl.html",
				"<div class=\"ui-select-container ui-select-multiple ui-select-bootstrap dropdown form-control\">" +
				"<div>" +

				//'<div class=\"clear\"></div>' +
				"<input type=\"text\" autocomplete=\"off\" autocorrect=\"off\" autocapitalize=\"off\" spellcheck=\"false\" class=\"ui-select-search input-xs\" placeholder=\"{{$selectMultiple.getPlaceholder()}}\" ng-disabled=\"$select.disabled\" ng-hide=\"$select.disabled\" ng-click=\"$select.activate()\" ng-model=\"$select.search\" role=\"combobox\" aria-label=\"{{ $select.baseTitle }}\" ondrop=\"return false;\">" +
				"<a class=\"sbToggle\" ng-click=\"$select.toggle($event)\">" +
				"</a>" +
				"</div>" +
				"<div class=\"ui-select-choices\">" +
				"</div>" +

				"<div class=\"ui-select-match\">" +
				"</div>" +
				"</div>"


			);

			$templateCache.put("wcm2/select-multiple.tpl.html",
				"<div class=\"ui-select-container ui-select-multiple ui-select-bootstrap dropdown form-control\" ng-class=\"{open: $select.open}\">" +
				"<div>" +

					//'<div class=\"clear\"></div>' +
				"<input type=\"text\" autocomplete=\"off\" autocorrect=\"off\" autocapitalize=\"off\" spellcheck=\"false\" class=\"ui-select-search input-xs\" placeholder=\"{{$selectMultiple.getPlaceholder()}}\" ng-disabled=\"$select.disabled\" ng-hide=\"$select.disabled\" ng-click=\"$select.activate()\" ng-model=\"$select.search\" role=\"combobox\" aria-label=\"{{ $select.baseTitle }}\" ondrop=\"return false;\">" +
				"<a class=\"sbToggle\" ng-click=\"$select.toggle($event)\">" +
				"</a>" +
				"</div>" +
				"<div class=\"ui-select-choices\">" +
				"</div>" +

				"<div class=\"ui-select-match\">" +
				"</div>" +
				"</div>");


			$templateCache.put("wcm/select.tpl.html",
				"<div class=\"ui-select-container ui-select-bootstrap simple-select dropdown\">" +
				"<div class=\"ui-select-match\">" +
				"</div>" +
				"<input type=\"text\" autocomplete=\"off\" tabindex=\"-1\" aria-expanded=\"true\" aria-label=\"{{ $select.baseTitle }}\" aria-owns=\"ui-select-choices-{{ $select.generatedId }}\" aria-activedescendant=\"ui-select-choices-row-{{ $select.generatedId }}-{{ $select.activeIndex }}\" class=\"form-control ui-select-search\" placeholder=\"{{$select.placeholder}}\" ng-model=\"$select.search\" ng-show=\"$select.searchEnabled && $select.open\">" +
				"<a class=\"sbToggle\" ng-click=\"$select.toggle($event)\">" +
				"</a>" +
				"<div class=\"ui-select-choices\">" +
				"</div>" +
				"</div>");


			$templateCache.put("wcm2/select.tpl.html",
				"<div class=\"ui-select-container ui-select-bootstrap dropdown\" ng-class=\"{open: $select.open}\">" +
				"<div class=\"ui-select-match\">" +
				"</div>" +
				"<input type=\"text\" autocomplete=\"off\" tabindex=\"-1\" aria-expanded=\"true\" aria-label=\"{{ $select.baseTitle }}\" aria-owns=\"ui-select-choices-{{ $select.generatedId }}\" aria-activedescendant=\"ui-select-choices-row-{{ $select.generatedId }}-{{ $select.activeIndex }}\" class=\"form-control ui-select-search\" placeholder=\"{{$select.placeholder}}\" ng-model=\"$select.search\" ng-show=\"$select.searchEnabled && $select.open\">" +
					"<a class=\"sbToggle\" ng-click=\"$select.toggle($event)\">" +
					"</a>" +
				"<div class=\"ui-select-choices\">" +
				"</div>" +
				"</div>");


			$templateCache.put("template/timepicker/timepicker.html",
				"<table>\n" +
				"	<tbody>\n" +
				"		<tr>\n" +
				"			<td class=\"form-group\" ng-class=\"{'has-error': invalidHours}\">\n" +
				"				<input type=\"text\" ng-model=\"hours\" ng-change=\"updateHours()\" class=\"form-control text-center\" ng-readonly=\"readonlyInput\" maxlength=\"2\">\n" +
				"			</td>" +
				"			<td class=\"form-group\" ng-class=\"{'has-error': invalidMinutes}\">\n" +
				"				<input type=\"text\" ng-model=\"minutes\" ng-change=\"updateMinutes()\" class=\"form-control text-center\" ng-readonly=\"readonlyInput\" maxlength=\"2\">\n" +
				"			</td>\n" +
				"			<td>" +
				"				<a class=\"up\" ng-click=\"incrementMinutes()\"></a>" +
				"				<a class=\"down\" ng-click=\"decrementMinutes()\"></a>" +
				"			</td>" +
				"		</tr>\n" +
				"	</tbody>\n" +
				"</table>\n" +
				"");

			$templateCache.put("template/datepicker/day.html",
				"<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
				"  <thead>\n" +
				"    <tr class=\"month\">\n" +
				"      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
				"      <th colspan=\"{{5 + showWeeks}}\"><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
				"      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
				"    </tr>\n" +
				"    <tr class=\"days\">\n" +
				"      <th ng-show=\"showWeeks\" class=\"text-center\"></th>\n" +
				"      <th ng-repeat=\"label in labels track by $index\" class=\"text-center\"><small aria-label=\"{{label.full}}\">{{label.abbr}}</small></th>\n" +
				"    </tr>\n" +
				"  </thead>\n" +
				"  <tbody>\n" +
				"    <tr ng-repeat=\"row in rows track by $index\">\n" +
				//"      <td ng-show=\"showWeeks\" class=\"text-center h6\"><em>{{ weekNumbers[$index] }}</em></td>\n" +
				"      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
				"        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default btn-sm\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-muted': dt.secondary, 'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
				"      </td>\n" +
				"    </tr>\n" +
				"  </tbody>\n" +
				"</table>\n" +
				"");

			$templateCache.put("template/datepicker/month.html",
				"<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
				"  <thead>\n" +
				"    <tr>\n" +
				"      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
				"      <th><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
				"      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
				"    </tr>\n" +
				"  </thead>\n" +
				"  <tbody>\n" +
				"    <tr ng-repeat=\"row in rows track by $index\">\n" +
				"      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
				"        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
				"      </td>\n" +
				"    </tr>\n" +
				"  </tbody>\n" +
				"</table>\n" +
				"");


        }])

    .controller( 'AppCtrl', ['$scope', '$rootScope', '$interval', '$timeout', '$window', '$state', 
                             '$filter', '$translate', 'DocumentsResource', 'DocumentResource', '$sce', 
                             'utilityService', '$cookieStore', '$modal', '$stateParams', '$http', '$q',
                             function ($scope, $rootScope, $interval, $timeout, $window, $state, 
                            		 $filter, $translate, DocumentsResource, DocumentResource, $sce, 
                            		 utilityService, $cookieStore, $modal, $stateParams, $http, $q) {

    	$scope.lang = $rootScope.lang;
    	
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
            if ( angular.isDefined( toState.data.pageTitle ) ) {
                $scope.pageTitle = toState.data.pageTitle;
            }
        }); 
        
        function checkInbox(){
        	$rootScope.updateInboxCount();
        }
        
        // CHECK INBOX COUNT INTERVAL
        $interval(checkInbox, 300000);
        
        $scope.logout = function() {
        	//delete $window.sessionStorage.user;
        	delete $rootScope.user;
        	delete $rootScope.user_name;
        	delete $rootScope.roles;
			delete $scope.items;

			$cookieStore.remove('lang');
			$cookieStore.remove('user');
			$cookieStore.remove('user_name');
			$cookieStore.remove('isEditor');
			$cookieStore.remove('roles');
			$cookieStore.remove('is_inbox');

        	$scope.lang = $rootScope.lang;
        	$rootScope.reinit();
        	$state.go('login');
        };
        
        $scope.goBackFromNewDocument = function() {
			$rootScope.$DetailService.detail = undefined;

        	if(angular.isDefined($rootScope.prevState) && angular.isDefined($rootScope.prevState.name) && $rootScope.prevState.name != '') {
        		var state = $rootScope.prevState.name;
        		var params = $rootScope.prevState.params;
        		delete $rootScope.prevState;
        		$state.go(state, params);
        	} else {
        		$state.go('dashboard.my');                    		
        	}
        };
        
        $scope.search = function() {
        	var searchString = $rootScope.searchString = $scope.searchString;
        	//delete $rootScope.searchString;
        	delete $scope.searchString;
        	$state.go('dashboard.search', {searchString: searchString}, {reload: true});
        };     
        
        // DOCUMENT LIST FUNCTIONS
        
        $scope.openGroupOperationModal = function (items, operation) {
        	var enable = false;
        	
        	if(operation === 'delete') {
            	for(var index = 0; index < items.length; index++) {
            		if(items[index].operations.can_delete == true) {
            			enable = true;
            		}
            	}
            } else if(operation === 'workflow') {
            	for(var index = 0; index < items.length; index++) {
            		if(items[index].operations.can_workflow == true) {
            			enable = true;
            		}
            	}
            } else if(operation === 'new_version') {
            	for(var index = 0; index < items.length; index++) {
            		if(items[index].operations.can_upload == true) {
            			enable = true;
            		}
            	}            	
            } else if(operation === 'powerpromote') {
            	for(var index = 0; index < items.length; index++) {
            		if(items[index].operations.can_powerpromote == true) {
            			enable = true;
            		}
            	}            	
            } else if(operation === 'expire') {
            	for(var index = 0; index < items.length; index++) {
            		if(items[index].operations.can_expire == true) {
            			enable = true;
            		}
            	}            	
            } else if(operation === 'export') {
            	for(var index = 0; index < items.length; index++) {
            		if(items[index].operations.can_export == true) {
            			enable = true;
            		}
            	}            	
            } else if(operation === 'unlock') {
            	for(var index = 0; index < items.length; index++) {
            		if(items[index].operations.can_unlock == true) {
            			enable = true;
            		}
            	}            	
            } else if(operation === 'addlang') {
            	enable = true;
            }

        	if(enable == true) {
        		$rootScope.overlayClass = 'modalloader';
        		var modalInstance = $modal.open({
        			animation: false,
        			templateUrl: 'documents/groupOperationModal.tpl.html',
        			controller: 'GroupOperationModalCtrl',
        			size: 'lg',
        			resolve: {
        				docs: function () {
        					var array = [];
        					for(var docIndex = 0; docIndex < items.length; docIndex++) {
        						var item = items[docIndex];
        						if(angular.isDefined(item) && angular.isDefined(item.missing_translations) && operation == 'addlang') {
        							item.langs_available = [];
        							var keys = _.keys(item.missing_translations);
        							for(var index = 0; index < keys.length; index++) {
        								var key = keys[index];
        								item.langs_available.push({title : item.missing_translations[key], value: key});
        							}
        						}
        						array.push(item);                    		
        					}
        					return array;
        				},
        				operation: function () {
        					return operation;
        				}
        			}
        		});
        		
        		modalInstance.opened.then(function() {
        		});
        	}
			else {
				$rootScope.overlayClass = 'modalloader';
				var modalInstance = $modal.open({
					animation: false,
					templateUrl: 'documents/groupOperationModal.tpl.html',
					controller: 'GroupOperationModalCtrl',
					size: 'lg',
					resolve: {
						docs: function () {
							return [];
						},
						operation: function () {
							return "nofiles";
						}
					}
				});

				modalInstance.opened.then(function() {
				});
			}
        };

		$scope.isAllowOperation = function(list, operation) {

			var count = 0;

			angular.forEach(list, function(value , key) {
				if (value.operations[operation]) {
					count++;
				}
			});

			if (count > 0) {
				return true;
			}

			return false;
		}

        $scope.openDocumentOperationModal = function (item, operation) {
        	if(operation == 'addattachment' || operation == 'majorversion' || operation == 'cancelversion') {
        		var modalInstance = $modal.open({
        			animation: false,
        			templateUrl: 'documents/ruleOperationModal.tpl.html',
        			controller: 'RuleAttachmentUploadCtrl',
        			size: 'lg',
        			resolve: {
        				doc: function () {
        					return item;
        				},
        				operation: function () {
        					return operation;
        				}
        			}
        		});
        		modalInstance.opened.then(function() {
        		});
        	} else if(operation == 'createprotocol') {
        		$rootScope.$DocumentOperationService.createRuleProtocol(item.id).then(function(result) {
        			$state.go('document', {tab: 'Editor', documentId: result.id});
	  			}, function(error) {});
        	} else {
        		var modalInstance = $modal.open({
        			animation: false,
        			templateUrl: 'documents/documentOperationModal.tpl.html',
        			controller: 'DocumentOperationModalCtrl',
        			size: 'md',
        			resolve: {
        				doc: function () {
        					if(angular.isDefined(item) && angular.isDefined(item.missing_translations) && operation == 'addlang') {
        						item.langs_available = [];
        						var keys = _.keys(item.missing_translations);
        						for(var index = 0; index < keys.length; index++) {
        							var key = keys[index];
        							item.langs_available.push({title : item.missing_translations[key], value: key});
        						}
        					}
        					return item;
        				},
        				operation: function () {
        					return operation;
        				}
        			}
        		});
        		modalInstance.opened.then(function() {
        		});
        	}
     };

	 $rootScope.openTreeModal = function (formData, dataOptions, size, name, codetable, multi, folder, form, label, typeNodes) {

		 var modalInstance = $modal.open({
			 animation: true,
			 templateUrl: 'documents/treeModal.tpl.html',
			 controller: 'TreeModalCtrl',
			 size: 'lg',
			 resolve: {
				 origSelected: function () {
					 return formData[form][name];
				 },
				 codetable: function () {
					 return codetable;
				 },
				 name: function () {
					 return name;
				 },
				 options: function () {
					 return dataOptions[name];
				 },
				 multi: function () {
					 return multi;
				 },
				 folder: function () {
					 return folder;
				 },
				 label: function () {
					 return label;
				 },
				 typeNodes: function () {
					 return typeNodes;
				 }
			 }
		 });
		 modalInstance.result.then(function (selectedItem) {
			 formData[form][name] = selectedItem;
		 }, function () {
		 });
	 };

	 $scope.openBaseModal = function (formData, name, form, label, files_api, search_api, rootfolder_api, folder_select, multi_select) {

		 var modalInstance = $modal.open({
			 animation: true,
			 controller: 'BaseSelectCtrl',
			 templateUrl: 'documents/baseModal.tpl.html', //'documents/base-select.tpl.html',
			 scope: $scope,
			 size: 'lg'
			 ,
			 resolve: {
				 origSelected: function () {
					 return formData[form][name];
				 },
				 label: function () {
					 return label;
				 },
				 type: function () {
					 return [];//"image"
				 },
				 files_api: function () {
					 return files_api
				 },
				 search_api: function () {
					 return search_api
				 },
				 rootfolder_api: function () {
					 return rootfolder_api
				 },
				 folder_select: function () {
					 return (angular.isDefined(folder_select) && folder_select !== "undefined") ? folder_select : false;
				 },
				 multi_select: function () {
					 return (angular.isDefined(multi_select) && multi_select !== "undefined") ? multi_select : false;
				 },
				 only_can_workflow: function() {
					 return false;
				 }
			 }
		 });

		 modalInstance.result.then(function (selectedItem) {

			 formData[form][name] = selectedItem;
			 }, function () {
		 });
		};

	 $rootScope.remove = function(node, name, formData, propertyName) {
		 var index = formData[propertyName][name].indexOf(node);
		 formData[propertyName][name].splice(index, 1);
		 formData[propertyName][name] = angular.copy(formData[propertyName][name]);
	 };


	 $scope.saveAllBackground = function(actiontype, newPost, xmlResult, oldScope) {
		oldScope.saveAll(actiontype, newPost, xmlResult, $scope);
	 };

	 $scope.saveMetadataBackground = function (actiontype, newPost, oldScope) {
		 oldScope.saveMetadata(actiontype, newPost, $scope);

	 };

	 $scope.saveEditorBackground = function (actiontype, xmlResult, oldScope) {
		 oldScope.saveEditor(actiontype, xmlResult, $scope);
	 };

	 $scope.saveWithoutChangeBackground = function (actiontype, oldScope) {
		 oldScope.saveWithoutChange(actiontype, $scope);
	 }

	 $scope.startWorkflowBackgroung = function (modalScope) {
		 modalScope.startWorkflow(modalScope, $scope);
	 };

	 $scope.refreshState = function() {
		 delete $scope.items;
		 $state.go($state.current, $stateParams, {reload: true});
	 };
	 
	 $scope.filterItems = function() {
		    var searchValue = $('#quick-search').val();
		    $('tbody.searchable').each(function() {
		    	var found = false;
		    	if(searchValue === '') {
		    		$(this).show();
		    	} else {
		    		$(this).find('td.searchable').each(function(){
		    			if(!found && $(this).text() != '') {
		    				found = $(this).text().toLowerCase().indexOf(searchValue.toLowerCase()) != -1;
		    			}
		    		});
		    		if(found) {
		    			$(this).show();
		    		} else {
		    			$(this).hide();
		    		}
		    	}
		    });    	
		};

	 $scope.mapToList = function (options, reverse) {
		 if(angular.isUndefined(reverse)) {
			 reverse = false;
		 }

		 return $q(function(resolve, reject) {
			 var newOptions = [];

			 angular.forEach(options, function (value, attr) {

				 var tempObj = {};
				 if(reverse == true) {
					 tempObj['id'] = value;
					 tempObj['value'] = value;
					 tempObj['text'] = value;
					 tempObj['name'] = value;
				 } else {
					 tempObj['id'] = value;
					 tempObj['value'] = value;
					 tempObj['text'] = attr;
				 }


				 newOptions.push(tempObj);
			 });

			 resolve(newOptions);
		 });


	 };



    }])

    .filter('strLimit', ['$filter', function($filter) {
        return function(input, limit) {
            if (! input) return;
            if (input.length <= limit) {
                return input;
            }

            return $filter('limitTo')(input, limit) + '...';
        };
    }])

	.filter('strLimitReverse', ['$filter', function($filter) {
		return function(input, limit) {
			if (! input) return;

			if (input.length > limit) {
				return '...' +  input.substring(input.length - limit, input.length);
			}

			return input;
		};
	}])

	.filter('strLimitMiddle', ['$filter', function($filter) {
		return function(input, limit) {
			if (! input) return;


			var split = input.split('/');

			if (split.length < 2) {
				return input;
			}
			else {

				var lastText = split[split.length - 2] + '/' + split[split.length - 1];

				if (lastText.length < limit) {
					return '/' + split[1] + '/.../' + split[split.length - 2] + '/' + split[split.length - 1];
				}

				return '/' + split[1] + '/.../' + lastText.substring(input.length - limit, input.length);
			}

			//if (input.length > limit) {
			//	return input.substring(0, 6) + ' ... ' +  input.substring(input.length - limit, input.length);
			//}

			//return input;
		};
	}])
    
    .filter('withoutInterpunction', ['$filter', function($filter) {
    	var sdiak="áäčďéěíĺľňóôőöŕšťúůűüýřžÁÄČĎÉĚÍĹĽŇÓÔŐÖŔŠŤÚŮŰÜÝŘŽ";
    	var bdiak="aacdeeillnoooorstuuuuyrzAACDEEILLNOOOORSTUUUUYRZ";

    	return function(input) {
    		var result = "";
            if (!input) return;
            for(p=0; p < input.length; p++) {
            	if (sdiak.indexOf(input.charAt(p))!=-1) { result += bdiak.charAt(sdiak.indexOf(input.charAt(p)));            		
            	} else { result += input.charAt(p); }
        	}
        	return result;
        };
    }])


	.directive('datepickerPopup', function (dateFilter, datepickerPopupConfig) {
		return {
			restrict: 'A',
			priority: 1,
			require: 'ngModel',
			link: function(scope, element, attr, ngModel) {
				var dateFormat = attr.datepickerPopup || datepickerPopupConfig.datepickerPopup;
				ngModel.$formatters.push(function (value) {
					return dateFilter(value, dateFormat);
				});
			}
		};
	})

	.controller( 'QuestionModalCtrl', ['$scope', '$modalInstance', 'title', 'text',
		function($scope, $modalInstance, title, text) {

			$scope.title = title;
			$scope.text = text;


			$scope.ok = function () {
				$modalInstance.close("save");
			};

			$scope.cancel = function () {
				$modalInstance.close("notsave");
			};

			$scope.closeModal = function () {
				$modalInstance.close("cancel");
			};

	}])

	.controller( 'DiffModalCtrl', ['$scope', '$filter', '$sce', '$timeout', '$modalInstance', 'title', 'text', 'left', 'right',
		function($scope, $filter, $sce, $timeout, $modalInstance, title, text, left, right) {

			$scope.title = title;
			$scope.text = text;
			$scope.left = left;
			$scope.right = right;


			$scope.diffdoc = $filter('diff')($scope.left, $scope.right).toString();
            //
            $scope.diffdocHtml = $sce.trustAsResourceUrl('data:text/html;charset=utf-8,' + encodeURIComponent($scope.diffdoc));

			$timeout(function() {
				var iframe = document.getElementById("diffIframe");
				var iWindow = iframe.contentWindow;
				var doc = iframe.contentDocument || iframe.contentWindow.document;
				var height = iWindow.document.body.scrollHeight;
				$("#diffIframe").css('height', height + 20 + 'px');
			}, 1000);

			$scope.close = function () {
				$modalInstance.close(true);
			};


		}])






