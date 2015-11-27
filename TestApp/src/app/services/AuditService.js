angular.module('service-audit', ['ui.router'])
.service('AuditService', ['$q', '$rootScope', '$localStorage',
        function ($q, $rootScope, $localStorage) {


			$rootScope.$storage = $localStorage;

			$rootScope.$watch('user_name', function () {

				if (angular.isDefined($rootScope.$storage['audit_' + $rootScope.user_name])) {
					$rootScope.$AuditService.audit = $rootScope.$storage['audit_' + $rootScope.user_name];
				} else {
					$rootScope.$storage['audit_' + $rootScope.user_name] = [];
				}
			});

			// ADD AUDIT MESSAGE
			this.addAuditItem = function(clazz, title, message, exception, item) {
				var auditItem = {clazz: clazz, title: title, message: message, exception: exception, item: item};
				this.write(auditItem);
			};

			// WRITE AUDIT MESSAGE INTO COOKIES
			this.write = function(auditItem) {
				auditItem.timestamp = new Date();

				if (angular.isUndefined($rootScope.$storage['audit_' + $rootScope.user_name])) {
					$rootScope.$storage['audit_' + $rootScope.user_name] = [];
				}

				$rootScope.$storage['audit_' + $rootScope.user_name].push(auditItem);

				if ($rootScope.$storage['audit_' + $rootScope.user_name].length > 100) {
					$rootScope.$storage['audit_' + $rootScope.user_name].shift();
				}

				$rootScope.$AuditService.audit = $rootScope.$storage['audit_' + $rootScope.user_name];
			};
 }]);