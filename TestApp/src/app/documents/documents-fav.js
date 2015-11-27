angular.module('documents-fav', ['ui.router'])
    
.controller( 'FavDocumentsCtrl', ['$scope', '$rootScope', '$sce', function($scope, $rootScope, $sce) {
		$rootScope.$ListService.init('subscriptions', undefined, true);
    }]);