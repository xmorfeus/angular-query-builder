angular.module('auth', ['ui.router'])

.factory('Auth', ['$rootScope', '$window', '$cookieStore', function ($rootScope, $window, $cookieStore) {
    return {
        isLoggedIn: function() {
            if(angular.isUndefined($rootScope.user) && $cookieStore.get('user') != "undefined") {
                var user = angular.fromJson($cookieStore.get('user'));
                if(angular.isDefined(user)) {
                    $rootScope.user = user;
                    return true;
                }
            }
            return angular.isDefined($rootScope.user);
        },
        authorizeState: function(state) {
            if(state.name.indexOf('app.error') > -1) { return true; }
            if(angular.isDefined(state.data) && angular.isDefined(state.data.rights)) {
                var result = _.find($rootScope.user.rights, function(right) {
                    return _.find(state.data.rights, function(stateRight) {
                        return right == stateRight;
                    });
                });
                return _.isUndefined(result) ? false : true;
            }
            return true;
        },
        authorizeElement: function(rights) {
            if(angular.isDefined(rights) && angular.isDefined($rootScope.user) && angular.isDefined($rootScope.user.rights)) {
                var result = _.find(rights.split(','), function(right) {
                    return _.find($rootScope.user.rights, function(userRight) {
                        return right == userRight;
                    });
                });
                return _.isUndefined(result) ? false : true;
            }
            return false;
        }
    };
}])

  	.controller( 'LoginCtrl', ['$scope', '$rootScope', '$window', '$state', 'AuthService', 'DocumentsResource', 'tmhDynamicLocale','$cookieStore',
        function($scope, $rootScope, $window, $state, AuthService, DocumentsResource, tmhDynamicLocale, $cookieStore ) {

        $scope.lang = {};
        $scope.langs = [];
        $scope.username = configuration.defUser;
        
        DocumentsResource.list({
                   	operation: 'langs'
                   	}, 
       	        function(response) {
                   	$scope.langs = response.data;
                    $scope.lang.selected = $scope.langs[0];
               	});

  		$scope.login = function() {
  			$rootScope.lang =  $scope.lang.selected;
  			$rootScope.user =  $scope.username;


            var lng = $rootScope.lang.object_name;
            tmhDynamicLocale.set(lng.replace("_","-"));

  			//$window.sessionStorage.user = angular.toJson($rootScope.user, false);
  			AuthService.getUser();
  			AuthService.getRoles();

            if($rootScope.isEditor) {
                $state.go('dashboard.inbox');
            } else {
                $state.go('dashboard.my');
            }
  	    };
  	    
  	    
    }])

    .controller( 'LoginUserCtrl', ['$scope', '$rootScope', '$window', '$state', 'AuthService', 'DocumentsResource', 'tmhDynamicLocale','$cookieStore', '$stateParams',
        function($scope, $rootScope, $window, $state, AuthService, DocumentsResource, tmhDynamicLocale, $cookieStore, $stateParams ) {

            $scope.logout();

            $scope.lang = {};
            $scope.langs = [];
            $scope.username = $stateParams.user;


            DocumentsResource.list({
                    operation: 'langs'
                },
                function(response) {
                    $scope.langs = response.data;
                    $rootScope.lang = $scope.langs[0];
                });

            $rootScope.user =  $stateParams.user;

            var lng = $rootScope.lang.object_name;
            tmhDynamicLocale.set(lng.replace("_","-"));

            AuthService.getUser();
            AuthService.getRoles();

            if($rootScope.isEditor) {
                $state.go('dashboard.inbox');
            } else {
                $state.go('dashboard.my');
            }




        }])

    .controller( 'AuditCtrl', ['$scope', '$rootScope', '$window', '$state', 
  	                           function($scope, $rootScope, $window, $state) {
  	    
  	    
    }])
    
    .service('AuthService', ['$http', '$q', '$filter', '$rootScope', '$window', '$state', 'DocumentsResource', '$cookieStore',
                             function ($http, $q, $filter, $rootScope, $window, $state, DocumentsResource, $cookieStore) {

        this.getUser = function () {
            var deferred = $q.defer();

            return $http({
                method: "GET",
                url: $rootScope.wcmConfig.backend + "?id=user",
                headers: { 'Content-Type': 'application/json' }
            }).success(function (response) {
            	$rootScope.isEditor = false;
                if (response.user_os_name != undefined)
                {
                	$rootScope.user = response.user_os_name;
                	$rootScope.user_name = response.user_name;
                	//$window.sessionStorage.user = angular.toJson($rootScope.user, false);
                	$rootScope.isEditor = response.user_group_name == 'content manager';


                    $cookieStore.put('lang', $rootScope.lang);
                    $cookieStore.put('user', $rootScope.user);
                    $cookieStore.put('user_name', $rootScope.user_name);

                    $cookieStore.put('isEditor', $rootScope.isEditor);
                }
                
                $rootScope.updateInboxCount();

            }).error(function (error) {
            	$rootScope.$MessageService.writeException(error);
                //delete $window.sessionStorage.user;
            	delete $rootScope.user;
            	delete $rootScope.user_name;

                $cookieStore.remove('lang');
                $cookieStore.remove('user');
                $cookieStore.remove('user_name');
                $cookieStore.remove('isEditor');

            	$state.go('login');
            });
        },
        
        this.getRoles = function() {
        	var deferred = $q.defer();

            return $http({
                method: "GET",
                url: $rootScope.wcmConfig.backend + "?id=roles",
                headers: { 'Content-Type': 'application/json' }
            }).success(function (response) {
                if (response.data != undefined) {
                	//$window.sessionStorage.roles = response.data;
                	$rootScope.roles = response.data;
                    $cookieStore.put('roles', response.data);
                    var is_inbox = false;
                    for(var index = 0; index < response.data.length; index++) {
                    	if(response.data[index].group_name.search('cms_') != -1) {
                    		if(is_inbox == false && response.data[index].group_name.search('_kcp') != -1) {
                    			is_inbox = false;
                    		} else {
                    			is_inbox = true;
                    		}
                    	}
                    }
                    $rootScope.is_inbox = is_inbox;
                    $cookieStore.put('is_inbox', is_inbox);
                }
            }).error(function (error) {
            	$rootScope.$MessageService.writeException(error);
                //delete $window.sessionStorage.roles;
            	delete $rootScope.roles;
                $cookieStore.remove('roles');
                $cookieStore.remove('is_inbox');
            });
        };

    }]);

  
