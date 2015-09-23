var app = angular.module('test', ['ngRoute']);

app.config(function($routeProvider, $locationProvider){
    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'loginCtrl'
        })
        .when('/admin', {
            templateUrl: 'views/admin.html',
            controller: 'adminCtrl'
        })
        .when('/priv_uk', {
            templateUrl: 'views/priv_en.html',
            controller: 'privUkCtrl'
        })
        .when('/priv_dk', {
            templateUrl: 'views/priv_da.html',
            controller: 'privDkCtrl'
        })

        .when('/public', {
            templateUrl: 'views/public.html',
            controller: 'publicCtrl'
        })
        .otherwise({redirectTo: '/login'})
});

app.controller('loginCtrl',['$scope', '$http', '$location', function($scope, $http, $location){
    $scope.submit = function(){
        console.log('loginCtrl - angular route');
        $http.post('/login/authenticate', $scope.form)
            .then(function(response){
                console.log(response.data);
                var user = response.data;
                if(user.acct_type === 'admin'){
                    $location.path('/admin');
                }
                else if(user.acct_type === 'private' && user.lang === 'en'){
                    $location.path('/priv_uk');
                }
                else if(user.acct_type === 'private' && user.lang === 'da'){
                    $location.path('/priv_dk');
                }
                else if(user.acct_type === 'public'){
                    $location.path('/public');
                }
                else{$location.path('/login')};
            });
    };
}]);

app.controller('adminCtrl', ['$scope', '$http', function($scope, $http){
    $scope.message = 'velkommen til adminafdelingen';
}]);

app.controller('privDkCtrl', ['$scope', '$http', function($scope, $http){
    $scope.message = 'velkommen vandaler';
}]);

app.controller('privUkCtrl', ['$scope', '$http', function($scope, $http){
    $scope.message = 'welcome kilsythians';
}]);

app.controller('publicCtrl', ['$scope', '$http', function($scope, $http){
    $scope.message = 'velkommen til den offentlige afdeling';
}]);