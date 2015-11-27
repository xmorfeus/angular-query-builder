angular.module('webcabinets', ['ui.router'])
.controller( 'WebCabinetsCtrl', ['$scope', '$rootScope', '$stateParams', '$filter', '$modal', 'DocumentsResource', 
                                 function($scope, $rootScope, $stateParams, $filter, $modal, DocumentsResource) {


	$rootScope.$ListService.init('webcabinets', 'cabinet_files');

	$scope.quickSearch = true;
}])

.controller( 'BaseSelectEditorCtrl', ['$scope', '$rootScope', '$stateParams', '$filter', '$modal', 'DocumentsResource',
                                 function($scope, $rootScope, $stateParams, $filter, $modal, DocumentsResource ) {


	 var rootfolder_api = $stateParams.rootfolder_api;
	 var files_api = $stateParams.files_api;
	 var search_api = $stateParams.search_api;
	 var type = $stateParams.type;
	 var params = $stateParams.params;


	 if (angular.isUndefined(rootfolder_api)) {
		 rootfolder_api = '/';
	 }

	 if (angular.isUndefined(files_api)) {
		 files_api = 'cabinet_files';
	 }


	 $scope.types = [];

	 $scope.filteritems = []; //[{value: 'images', text: 'Obrázky'}, {value: 'xml', text: 'Dokumenty'}];
	 $scope.filteritems.selectedType = [];

	 $scope.hideFilter = true;
	 $scope.active = false;

	 if (angular.isDefined(type)) {

		 var res = $filter('filter')($scope.filteritems, {value: type})[0];

		 if (angular.isDefined(res)) {
			 $scope.types.push($filter('filter')($scope.filteritems, {value: type})[0]);
		 }

		 $scope.filteritems.selectedType = $scope.types;

		 $scope.active = $scope.types.length > 0 ? true : false;
	 }


	 $scope.setType = function() {
		 $scope.types = $scope.filteritems.selectedType;

		 $scope.active = $scope.types.length > 0 ? true : false;

		 $rootScope.$ListService.filter.opened = false;
	 }
	 $scope.clearType = function() {
		 $scope.filteritems.selectedType = [];

		 $scope.active = false;

		 $rootScope.$ListService.filter.opened = false;
	 }

	 $scope.isInListType = function (type) {

		 if ($scope.types.length === 0) {
			 return true;
		 }

		 if ($filter('filter')($scope.types, {value: type}).length > 0) {
			 return true;
		 };

		 return false;
	 }

	 //rootfolder_api = "/CS_IA/Redakce/Sprava_Intranetu/Bannery/Obrazky";
	 //console.log(rootfolder_api);

	 // call api from parameter
	 $rootScope.$ListService.init('webcabinets', files_api, true, rootfolder_api, search_api, true, params);


	 $scope.toggleFavs = function() {
		 $scope.showFavs = !$scope.showFavs;
		 if($scope.showFavs == true) {
			 $scope.loadFavs();
		 }
	 }

	 $scope.selectFile = function(item) {
		 if($scope.selected == item) {
			 delete $scope.selected;
			 document.getElementById('selectImage').value = undefined;
		 } else {
			 $scope.selected = item;
			 document.getElementById('selectImage').value = item.name;
		 }
	 }

	 $scope.loadFavs = function() {
		$rootScope.overlayClass= 'favfolders';
		$scope.favFolders = [];
		 DocumentsResource.favFolders({},
			 function(response) {
				 if (response.data != undefined) {
					 $scope.favFolders = response.data;
				 }
				 else {
					 if (response.id != undefined) {
						 $scope.favFolders.push(response);
					 }
				 }
			 });
	 };

	 $scope.showFavs = false;
	 $scope.quickSearch = false; //true;
}])

.controller( 'BaseSelectCtrl', ['$scope', '$rootScope', '$state', '$stateParams', '$filter', '$modal', 'DocumentsResource', '$modalInstance', 'origSelected', 'label', 'type', 'files_api', 'search_api', 'rootfolder_api', 'folder_select', "multi_select", 'only_can_workflow',
	function($scope, $rootScope, $state, $stateParams, $filter, $modal, DocumentsResource, $modalInstance, origSelected, label, type, files_api, search_api, rootfolder_api, folder_select, multi_select, only_can_workflow) {

	$rootScope.setLoader(undefined);

	$scope.folder_select = folder_select;
	$scope.multi_select =  multi_select;
	$scope.search_api = search_api;
	$scope.label = label;

	if (angular.isUndefined(rootfolder_api) || angular.isDefined(rootfolder_api) && rootfolder_api === "undefined") {
		rootfolder_api = '/';
	}

	if (angular.isUndefined(files_api) || angular.isDefined(files_api) && files_api === "undefined") {
		files_api = 'cabinet_files';
	}

	$scope.types = [];

	$scope.filteritems = [{value: 'image', text: 'Obrázky'}, {value: 'xml', text: 'Dokumenty'}];
	$scope.filteritems.selectedType = [];

	$scope.hideFilter = false;
	$scope.active = false;
	$scope.only_can_workflow = only_can_workflow;

	if (angular.isDefined(type)) {
		if (only_can_workflow == false) {
			var res = $filter('filter')($scope.filteritems, {value: type})[0];

			if (angular.isDefined(res)) {
				$scope.types.push($filter('filter')($scope.filteritems, {value: type})[0]);
			}

			$scope.filteritems.selectedType = $scope.types;

			$scope.active = $scope.types.length > 0 ? true : false;
		}
	}


	$scope.setType = function() {
		$scope.types = $scope.filteritems.selectedType;

		$scope.active = $scope.types.length > 0 ? true : false;

		$rootScope.$ListService.filter.opened = false;
	}
	$scope.clearType = function() {
		$scope.filteritems.selectedType = [];

		$scope.active = false;

		$rootScope.$ListService.filter.opened = false;
	}

	$scope.isInListType = function (type) {
		if ($scope.types.length === 0) {
			return true;
		}

		if ($filter('filter')($scope.types, {value: type}).length > 0) {
			return true;
		};

		return false;
	}

		//rootfolder_api = "/CS_IA/Redakce/Sprava_Intranetu/Bannery/Obrazky";
		//console.log(rootfolder_api);

		if (angular.isUndefined(rootfolder_api) || rootfolder_api === "undefined") {
			rootfolder_api = "";
		}

		if (angular.isUndefined(search_api) || search_api === "undefined") {
			search_api = "";
		}

			// call api from parameter
		$rootScope.$ListService.init('webcabinets', files_api, true, rootfolder_api, search_api, true);

	
	$scope.toggleFavs = function() {
		$scope.showFavs = !$scope.showFavs;
		if($scope.showFavs == true) {
			$scope.loadFavs();
		}
	}
	
	$scope.selectFile = function(item) {

		var copyItem = angular.copy(item);

		if (multi_select === false) {

			var origSelectedFile = $filter('filter')($rootScope.$ListService.items[$rootScope.$ListService.getType()], {isSelect: true});

			angular.forEach(origSelectedFile, function (value, key) {

				value.isSelect = false;
			});
		}

		item.isSelect = angular.isDefined(copyItem.isSelect) ? !copyItem.isSelect : true;


		//if($scope.selected == item) {
		//	//delete $scope.selected;
		//
		//	//document.getElementById('selectImage').value = undefined;
		//} else {
		//	//$scope.selected = item;
		//	//document.getElementById('selectImage').value = item.name;
		//}
	}
	
	$scope.loadFavs = function() {
		$rootScope.overlayClass= 'favfolders';
		$scope.favFolders = [];
		DocumentsResource.favFolders({},
			function(response) {
				if (response.data != undefined) {
					$scope.favFolders = response.data;
				}
				else {
					if (response.id != undefined) {
						$scope.favFolders.push(response);
					}
				}
			});
	};
	
	$scope.showFavs = false;
	$scope.quickSearch = false; //true;
	
		$scope.ok = function () {


			var selected = $filter('filter')($rootScope.$ListService.folders[$rootScope.$ListService.getType()], {isSelect: true});
			var selectedFile = $filter('filter')($rootScope.$ListService.items[$rootScope.$ListService.getType()], {isSelect: true});

			selected = selected.concat(selectedFile);


			if (selected.length > 1) {

				angular.forEach(selected, function (value, key) {


					if (angular.isUndefined(value.name)) {
						value.name = value.object_name;
						value.value = value.object_name;
					}
				});

				$scope.origSelectedNodes = selected;
			}
			else if (selected.length === 1) {

				if (angular.isUndefined(selected[0].name)) {
					selected[0].name = selected[0].object_name;
					selected[0].value = selected[0].object_name;
				}
				selected[0].value = selected[0].name;

				$scope.origSelectedNodes = selected;
			}
			else {
				$scope.origSelectedNodes = [];
			}

			$rootScope.$ListService.closeModal();
			$modalInstance.close($scope.origSelectedNodes);


		};

		$scope.cancel = function () {
			$rootScope.$ListService.closeModal();
			$modalInstance.dismiss('cancel');
		};
	}]);



  