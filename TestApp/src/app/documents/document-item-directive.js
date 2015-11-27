angular.module('document-directives', [])

.directive('documentitem', function() {
    return {
        restrict: 'A',
        replace: true,
        scope: true,
        templateUrl: 'documents/document-item.tpl.html',
        link: function(scope, element, attrs) {
        }
    };
})
;