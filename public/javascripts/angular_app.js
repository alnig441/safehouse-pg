var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ngAnimate', 'ngFileUpload']);

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

//Routing on acct_type
app.controller('loginCtrl',['$scope', '$http', '$location', function($scope, $http, $location){
    console.log('in login ctrl ');
    $scope.submit = function(){
        // console.log('loginCtrl - angular route', $scope.form);
        $http.post('/login/authenticate', $scope.form)
            .then(function(response){
                // console.log(response);
                if(response.data.acct_type === 'admin'){
                    $location.path('/admin');
                }
                else if(response.data.acct_type === 'private' && response.data.lang === 'en'){
                    $location.path('/priv_uk');
                }
                else if(response.data.acct_type === 'private' && response.data.lang === 'da'){
                    $location.path('/priv_dk');
                }
                else if(response.data.acct_type === 'public'){
                    $location.path('/public');
                }
                else{$location.path('/login')};
            });
    };
}]);


app.controller('adminCtrl', ['$scope', '$http', 'Upload', '$timeout', '$location', function($scope, $http, Upload, $timeout, $location){
//app.controller('adminCtrl', ['$scope', '$http', function($scope, $http){

        var forms = document.getElementsByTagName('form');
        var acct = document.getElementById('viewAcct');
        var event = document.getElementById('viewEvent');
        //var alert = document.getElementById('alerts');
        //console.log(forms.addAcct);

        $scope.showAddAcctForm = function(){
            console.log('show add form');
            angular.element(acct).css('display', 'none');
            angular.element(event).css('display', 'none');
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
            angular.element(event).css('display', 'none');
            angular.element(forms).css('display', 'none');
            angular.element(forms.delAcct).css('display', 'block');

        };

        $scope.viewAcct = function(){
            console.log('viewing acct ....', $scope.form.acct_type);
            $http.get('/admin_crud/'+ $scope.form.acct_type)
                .then(function(response){
                    var alert = document.getElementById('alerts');
                    console.log('in scope-delete-acct logging response', response.data);
                    $scope.users = response.data;
                    console.log($scope.users);
                    //$scope.form.acct_type = response.data.acct_type;
                    //$scope.form.id = response.data._id;
                    $scope.form.id = response.data.id;
                    //$scope.form.lang = response.data.lang;
                    angular.element(alert).html(response.data);
                    angular.element(acct).css('display', 'inline');
                })
        };

        $scope.delAcct = function(){
            console.log('deleting acct... ', this.user.username);
            $http.delete('/admin_crud/' + this.user.username)
                .then(function(response){
                    var alert = document.getElementById('alerts');
                    console.log('printing response: ', response);
                    angular.element(alert).html(response.data);
                    $scope.viewAcct();
                })
        };

        $scope.showChgPWForm = function(){
            console.log('show change pw form');
            angular.element(acct).css('display', 'none');
            angular.element(event).css('display', 'none');
            angular.element(forms).css('display', 'none');
            angular.element(forms.chgPW).css('display', 'block');

        };

        $scope.chgPW = function(){
            console.log('changing pw for acct ', $scope.form.username);

            if($scope.form.new_password === $scope.form.confirm_password){
                $http.put('/admin_crud/chg', $scope.form)
                    .then(function(response){
                        console.log('printing response in chgpw ',response);
                        var alert = document.getElementById('alerts');
                        console.log('printing response: ', response);
                        angular.element(alert).html(response.data);
                    })
            }
            else {
                angular.element(document.getElementById('alerts')).html('password mismatch');
            }


        };


        $scope.showAddEventForm = function(){
            console.log('show add event form');
            angular.element(acct).css('display', 'none');
            angular.element(event).css('display', 'none');
            angular.element(forms).css('display', 'none');
            angular.element(forms.addEvent).css('display', 'block');

        };

        $scope.addEvent = function(){
            $scope.form.url = document.getElementById('image').placeholder;
            $http.post('/event_crud/add', $scope.form)
                .then(function(response){
                    console.log('image post response: ', response);
                    angular.element(document.getElementById('alerts')).html(response.data);
                })
        };

         $scope.uploadFiles = function(file){
             $scope.f = file;
             if(file && !file.$error) {
                 file.upload = Upload.upload({
                     url: '/event_crud/upload',
                     data: {file: file}
                     });
                 file.upload.then(function(response){
                     $timeout(function(){
                         file.result = response.data;
                         });
                 }, function(response){
                     if(response.status > 0)
                     $scope.errorMsg = response.status + ': ' + response.data;
                 });
                 file.upload.progress(function(evt){
                     file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                 });
             }
         };

        $scope.showGetEventForm = function(){
            console.log('get event form');
            angular.element(acct).css('display', 'none');
            angular.element(event).css('display', 'none');
            angular.element(forms).css('display', 'none');
            angular.element(forms.getEvent).css('display', 'block');

        };

        $scope.getEventById = function(){
            console.log('getting most recent event...');
            angular.element(acct).css('display', 'none');
            angular.element(forms).css('display', 'none');
            var latest = document.getElementById('latest');

            $http.get('/event_crud/view')
                .then(function(response){
                    console.log('get event response ', response);
                    $scope.form = response.data;
                    angular.element(event).css('display', 'block');
                })
        };

        $scope.logout = function(){
            $http.get('/logout')
                .then(function(response){
                    $location.path('/login');
                })
        };


}]);


app.controller('privDkCtrl', ['$scope', '$http', '$log', '$modal', '$location', function($scope, $http, $log, $modal, $location){
    $scope.message = 'velkommen vandaler';
    $scope.animationsEnabled = true;
    $scope.open = function (size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                events: function () {
                    return $scope.event;
                }
            }
        });

    };

    $scope.logout = function(){
        $http.get('/logout')
            .then(function(response){
                $location.path('/login');
            })
    };


}]);

app.controller('privUkCtrl', ['$scope', '$http', '$log', '$modal', '$location', function($scope, $http, $log, $modal, $location){
    $scope.message = 'welcome kilsythians';
    console.log('in privukctrl');
    $scope.animationsEnabled = true;
    $scope.open = function (size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                events: function () {
                    return $scope.event;
                }
            }
        });

    };

    $scope.logout = function(){
        $http.get('/logout')
            .then(function(response){
                $location.path('/login');
            })
    };



}]);

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, $http) {
    $scope.temp ='';
    console.log('building modal');
    $http.get('/event_crud/view')
        .then(function(response){
            console.log('hej der', response);
            $scope.event = response.data;
            $scope.event.url ='./images/' + response.data.url;

        });


});


app.controller('publicCtrl', ['$scope', '$http', function($scope, $http){
    $scope.message = 'velkommen til den offentlige afdeling';
}]);

