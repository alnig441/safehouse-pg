var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ngAnimate']);

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
    console.log($scope);
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
    $scope.addAcct = function(){
      console.log('show add form');
        var addAcct = document.getElementById('addAcct');
        var delAcct = document.getElementById('delAcct');
        var chgPW = document.getElementById('chgPW');
        angular.element(addAcct).css('display', 'block');
        angular.element(delAcct, chgPW).css('display','none');

    };
    $scope.delAcct = function(){
        console.log('show delete form');
        var addAcct = document.getElementById('addAcct');
        var delAcct = document.getElementById('delAcct');
        var chgPW = document.getElementById('chgPW');
        angular.element(delAcct).css('display', 'block');
        angular.element(addAcct, chgPW).css('display','none');

    };
    $scope.chgPW = function(){
        console.log('show change pw form')
        var addAcct = document.getElementById('addAcct');
        var delAcct = document.getElementById('delAcct');
        var chgPW = document.getElementById('chgPW');
        angular.element(chgPW).css('display', 'block');
        angular.element(delAcct, addAcct).css('display','none');

    };

    $scope.submit = function(){
        console.log('adding acct ....', $scope);
        $http.post('/admin_crud/add', $scope.form)
            .then(function(response){
                //console.log(response);
            })
    }
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