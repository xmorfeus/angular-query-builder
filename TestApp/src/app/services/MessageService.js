angular.module('service-message', ['ui.router'])
.service('MessageService', ['$q', '$filter', '$timeout', '$rootScope', '$state', '$cookieStore', 'AuditService',
        function ($q, $filter, $timeout, $rootScope, $state, $cookieStore, AuditService) {
   	
   	this.messages = [];
   	
   	// CLOSE MESSAGE
   	this.close = function (msg) {
   		if(angular.isDefined(msg.timer)) { $timeout.cancel(msg.timer); }
   		this.messages = _.without(this.messages, msg);
   	};
   	
   	// TOGGLE MESSAGE DETAIL
   	this.toggleDetail = function(msg) {
   		msg.showDetail = !msg.showDetail;
   	};
   	
   	// ADD MESSAGE TO MESSAGES
   	this.addMessage = function(msg) {
   		this.messages.unshift(msg);
   	};
   	
   	// ============= MESSAGES ================
   	
	this.writeException = function (error) {
		var deferred = $q.defer();
		var message = undefined;
		var exception = undefined;


		if (error.data.data !== null) {
			error = error.data;
		}

		if (angular.isUndefined(error.data.messages) && angular.isDefined(error.data[0])) {
			error.data = error.data[0];
		}

		title = $filter('translate')("text.error"); // error.status + ": " + error.statusText;
		message = $filter('strLimit')(angular.isDefined(error.data.messages) ? error.data.messages[0].text : "", 100); // config.url;
		
		if (angular.isDefined(error.data) && error.data != null) {
			if(angular.isDefined(error.data.messages)) {
				exception = error.data.messages[0].level + ": " + error.data.messages[0].text;				
			}
		}

		// MESSAGE
		var msg = {
			showDetail: false, 
           	clazz: 'alert-danger', 
           	title: title,
           	message: message,
           	exception: exception,
           	validation: false
		};

		// TIMEOUT
		msg.timer = $timeout(function() { $rootScope.$MessageService.close(msg); }, 10000);
           
		this.messages.unshift(msg);
		AuditService.addAuditItem('error', title, message, undefined, undefined); //exception);
		return true;
	};
       
	this.writeError = function (title, message, detailText, item) {
		var deferred = $q.defer();
		
		// MESSAGE
		var msg = {
			showDetail: false, 
           	clazz: 'alert-danger', 
           	title: title,
           	message: message,
           	exception: detailText,
           	validation: false
		};
        
		// TIMEOUT
		msg.timer = $timeout(function() { $rootScope.$MessageService.close(msg); }, 10000);

		this.messages.unshift(msg);
		AuditService.addAuditItem('error', title, message, detailText, undefined);
		return true;
	};
       
	this.writeValidationError = function (title, message, detailText, item) {
		var deferred = $q.defer();

		// MEŠSAGE
		var msg = {
			showDetail: false, 
           	clazz: 'alert-danger', 
           	title: title,
           	message: message,
           	exception: detailText,
           	validation: true
		};

		// TIMEOUT
		msg.timer = $timeout(function() { $rootScope.$MessageService.close(msg); }, 10000);
           
		AuditService.addAuditItem('error', title, message, undefined, undefined);
           
		// closing old validation message
		var valMsg = _.findWhere(this.messages, {validation:true});
		if(angular.isDefined(valMsg)) {
			this.close(valMsg);
			$timeout(function() { $rootScope.$MessageService.addMessage(msg); }, 200);
		} else { this.messages.unshift(msg); }
           
		return true;
	};
       
	this.writeWarning = function (title, message, detailText, item) {
		var deferred = $q.defer();
		
		// MESSAGE
		var msg = {
			showDetail: false, 
           	clazz: 'alert-warning', 
           	title: title,
           	message: message,
           	exception: detailText,
           	validation: false
		};
		
		// TIMEOUT
		msg.timer = $timeout(function() { $rootScope.$MessageService.close(msg); }, 5000);

		this.messages.unshift(msg);
		AuditService.addAuditItem('warning', title, message, undefined, undefined);
		return true;
	};
       
	this.writeInfo = function (title, message, detailText, item) {
		var deferred = $q.defer();
		
		// MESSAGE
		var msg = {
			showDetail: false, 
           	clazz: 'alert-info', 
           	title: title,
           	message: message,
           	exception: detailText,
           	validation: false
		};

		// TIMEOUT
		msg.timer = $timeout(function() { $rootScope.$MessageService.close(msg); }, 5000);

		this.messages.unshift(msg);
		AuditService.addAuditItem('info', title, message, undefined, undefined);
		return true;
	};

	this.writeSuccess = function (title, message, detailText, undefined) {
		var deferred = $q.defer();
		
		// MESSAGE
		var msg = {
			showDetail: false, 
           	clazz: 'alert-success', 
           	title: title,
           	message: message,
           	exception: detailText,
           	validation: false
		};
		
		// TIMEOUT
		msg.timer = $timeout(function() { $rootScope.$MessageService.close(msg); }, 3000);
		
		this.messages.unshift(msg);
		AuditService.addAuditItem('success', title, message, undefined, undefined);
		return true;
	};
}]);