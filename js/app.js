var theFarmApp = angular.module("theFarmApp", [
	"ngRoute",
	"cropControllers",
]);

theFarmApp.config(["$routeProvider", function($routeProvider){
	$routeProvider.
	when('/list', {
		templateUrl: 'partials/ICG-list.html',
		controller: 'ListController'	
	}).
	when('/details/:itemId', {
		templateUrl: 'partials/ICG-details.html',
		controller: 'DetailsController'
	}).
	when('/plan', {
		templateUrl: 'partials/plan.html',
		controller: 'PlanController'
	}).
	when('/tsk', {
		templateUrl: 'partials/plan.html',
		controller: 'PlanController'
	}).
	otherwise({
		redirectTo: '/list'
	});
}]);

