angular.module('common.resources', ['ngResource'])

.factory('CommonResource', ['$resource', 'appConst', function ($resource, appConst) {
    return {
        technicalAccounts : function() {
            return $resource(appConst.boApiUrl + '/techAcc/:operation/:id', null, {
                findByWhitelabel: {
                    method: 'GET',
                    isArray: false,
                    params: {operation: 'whitelabel', id: '@id'}
                }
            });
        }
    };
}])
;