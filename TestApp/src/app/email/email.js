angular.module('email', ['ui.router'])
  	.controller( 'EmailCtrl', ['$scope', '$rootScope', 'EmailResource',
  	       function($scope, $rootScope, EmailResource) {
  		
  		EmailResource.getGroups({},
             function(response) {
  				if(response.values) {
  					$scope.mapToList(response.values, true).then(function(param) {
  						$scope.groups = param;
  					});
  				}
  			 }, function(error) {
  				$rootScope.$MessageService.writeException(error);
  		});
  		
  		$scope.selectGroup = function(item) {
  			$scope.group = item;
  		};
  		
  		$scope.$watch('group', function() {
  			if(angular.isDefined($scope.group)) {
  				EmailResource.getEmails({group: $scope.group.value},
  					function(response) {
  					$scope.emails = [];
  					if(response.data) {
  						$scope.emails = response.data;
  					} else if(response.user_name) {
  						$scope.emails.push(response);
  					}
  				}, function(error) {
  					$rootScope.$MessageService.writeException(error);
  				});  				
  			}
  		});
    }]);

  