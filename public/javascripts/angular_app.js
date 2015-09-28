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
    var forms = document.getElementsByTagName('form');
    var acct = document.getElementById('viewAcct');
    console.log(forms.addAcct);

    $scope.showAddAcctForm = function(){
      console.log('show add form');
        angular.element(acct).css('display', 'none');
        angular.element(forms).css('display', 'none');
        angular.element(forms.addAcct).css('display', 'block');

    };

    $scope.addAcct = function(){
        console.log('adding acct ....', $scope);
        $http.post('/admin_crud/add', $scope.form)
            .then(function(response){
                var alert = document.getElementById('alerts');
                angular.element(acct).css('display', 'none');
                console.log('in scope-add-acct logging response', response);
                angular.element(alert).html(response.data);
            })
    };

    $scope.showDelAcctForm = function(){
        console.log('show delete form');
        angular.element(acct).css('display', 'none');
        angular.element(forms).css('display', 'none');
        angular.element(forms.delAcct).css('display', 'block');

    };

    $scope.delAcct = function(){
        console.log('deleting acct ....', $scope.form.username);
        $scope.form.id;
        $http.get('/admin_crud/'+ $scope.form.username)
            .then(function(response){
                var alert = document.getElementById('alerts');
                console.log('in scope-delete-acct logging response', response.data);
                $scope.form.acct_type = response.data.acct_type;
                $scope.form.id = response.data._id;
                $scope.form.lang = response.data.lang;
                angular.element(alert).html(response.data);
                angular.element(acct).css('display', 'inline');
            })
    };

    $scope.showChgPWForm = function(){
        console.log('show change pw form');
        angular.element(acct).css('display', 'none');
        angular.element(forms).css('display', 'none');
        angular.element(forms.chgPW).css('display', 'block');

    };


    $scope.showAddEventForm = function(){
        console.log('show change pw form');
        angular.element(acct).css('display', 'none');
        angular.element(forms).css('display', 'none');
        angular.element(forms.addEvent).css('display', 'block');

    };

    $scope.showViewEventForm = function(){
        console.log('show change pw form');
        angular.element(acct).css('display', 'none');
        angular.element(forms).css('display', 'none');
        angular.element(forms.viewEvent).css('display', 'block');

    };

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