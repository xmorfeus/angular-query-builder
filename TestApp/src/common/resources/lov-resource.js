angular.module('common.lovResources', ['ngResource'])

.factory('LovService', ['$resource', 'appConst', function ($resource, appConst) {
    return {
        adminTransferTypes : function() {
            return $resource(appConst.boApiUrl + '/lov/adminTransferType');
        },
        adminTransferNotes : function() {
            return $resource(appConst.boApiUrl + '/lov/adminTransferNote');
        },
        accountStatusInternal: function() {
            return $resource(appConst.boApiUrl + '/lov/accountStatusInternal');
        },
        whitelabels: function () {
            return $resource(appConst.boApiUrl + '/lov/whitelabel');
        },

    };
}])
;