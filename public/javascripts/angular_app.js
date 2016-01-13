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

app.controller('logoutCtrl', function($scope, $location, $http){
    $scope.logout = function(){
        $http.get('/logout')
            .then(function(response){
                $location.path('/login');
            })
    };
});

app.controller('adminCtrl', ['$scope', '$http', 'Upload', '$timeout', '$location', function($scope, $http, Upload, $timeout, $location){
//app.controller('adminCtrl', ['$scope', '$http', function($scope, $http){
    $scope.acct = [
        {name: 'Private', value: 'private'},
        {name: 'Public', value: 'public'},
        {name: 'Admin', value: 'admin'}
    ];

    $scope.speak = [
        {name: 'English', value: 'en'},
        {name: 'Danish', value: 'da'}
    ];

    var forms = document.getElementsByTagName('form');
    var acct = document.getElementById('viewAcct');
    var event = document.getElementById('viewEvent');

    $scope.showAddAcctForm = function(){
        console.log('show add form');
        angular.element(acct).css('display', 'none');
        angular.element(event).css('display', 'none');
        angular.element(forms).css('display', 'none');
        angular.element(forms.addAcct).css('display', 'table');

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
        angular.element(forms.delAcct).css('display', 'table');

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
        angular.element(forms.chgPW).css('display', 'table');

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
        angular.element(forms.addEvent).css('display', 'table');

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
         console.log('save image?: ', $scope.form.img_save, $scope.f);

         //if($scope.form.img_save==true){
         //    console.log('we move on');
         //} else {
         //    console.log('we stop here');
         //}
         //

         if(file && !file.$error && $scope.form.img_save==true) {
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
        angular.element(forms.getEvent).css('display', 'table');

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
                angular.element(event).css('display', 'table');
            })
    };

}]);

app.controller('privDkCtrl', ['$scope','$rootScope', '$http', '$log', '$modal', '$location', function($scope, $rootScope, $http, $log, $modal, $location){
    //$scope.message = 'velkommen vandaler';
    var eventForm = document.getElementById('queryEvents');
    var imageForm = document.getElementById('queryImages');
    angular.element(eventForm).css('display', 'none');
    angular.element(imageForm).css('display', 'none');

    $scope.months = [
        {name: 'Januar', value: '01'},
        {name: 'Februar', value: '02'},
        {name: 'Marts', value: '03'},
        {name: 'April', value: '04'},
        {name: 'Maj', value: '05'},
        {name: 'Juni', value: '06'},
        {name: 'Juli', value: '07'},
        {name: 'August', value: '08'},
        {name: 'September', value: '09'},
        {name: 'Oktober', value: '10'},
        {name: 'November', value: '11'},
        {name: 'December', value: '12'}
    ];

    $scope.viewEventsForm = function () {
        angular.element(imageForm).css('display','none');
        angular.element(eventForm).css('display','table');

    };


    $scope.viewImagesForm = function () {
        angular.element(eventForm).css('display','none');
        angular.element(imageForm).css('display','table');

    };

}]);

app.controller('privUkCtrl', ['$scope', '$http', '$log', '$modal', '$location', '$rootScope', function($scope, $http, $log, $modal, $location, $rootScope){
    //$scope.message = 'welcome kilsythians';
    var eventForm = document.getElementById('queryEvents');
    var imageForm = document.getElementById('queryImages');
    angular.element(eventForm).css('display', 'none');
    angular.element(imageForm).css('display', 'none');

    $scope.months = [
        {name: 'January', value: '01'},
        {name: 'February', value: '02'},
        {name: 'March', value: '03'},
        {name: 'April', value: '04'},
        {name: 'May', value: '05'},
        {name: 'June', value: '06'},
        {name: 'July', value: '07'},
        {name: 'August', value: '08'},
        {name: 'September', value: '09'},
        {name: 'October', value: '10'},
        {name: 'November', value: '11'},
        {name: 'December', value: '12'}
    ];

    $scope.viewEventsForm = function () {
        angular.element(imageForm).css('display','none');
        angular.element(eventForm).css('display','table');
    };

    $scope.viewImagesForm = function () {
        angular.element(eventForm).css('display','none');
        angular.element(imageForm).css('display','table');

    };

}]);

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

app.controller('singleViewModalCtrl', function($scope, $http, $modal, $rootScope){
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

})

app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, $http) {

    console.log('building modal');
    $http.get('/event_crud/view')
        .then(function(response){
            console.log('hej der', response);
            $scope.event = response.data;

        });
    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    }

});

app.controller('multiViewModalCtrl', function($scope, $rootScope, $http, $modal){

    $scope.animationsEnabled = true;
    $scope.open2 = function (size) {

        console.log($scope.form);

        if($scope.form.meta){
            $scope.form.database = 'images';
        }
        else{
            $scope.form.database = 'events';
        }
        var temp = [];

        $http.post('/event_crud/select', $scope.form)
            .then(function(response){
                $rootScope.events = response.data;
                console.log('RIGHT HERE: ', $scope.form, $rootScope.events, response.data);

            })
            .then(function(){
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'myModalContent2.html',
                    controller: 'ModalInstanceCtrl2',
                    size: size,
                    resolve: {
                        events: function () {
                            return $rootScope.events;
                        }
                    }
                });

            });

    };
});

app.controller('ModalInstanceCtrl2', function($scope, $modalInstance, events) {
    console.log('building modal 2 ', events);
    $scope.selector = 0;

    $scope.events = events;
    $scope.selected = {
        event: $scope.events[$scope.selector]
    };

    console.log('Selected event: ', $scope.selected);

    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    };
    $scope.next = function(){
        if($scope.selector < events.length - 1){
            $scope.selector ++;
        }
        else{
            $scope.selector = 0;
        }
        $scope.selected = {
            event: $scope.events[$scope.selector]
        }
        console.log('SUCCESS', $scope.selector, $scope.selected);
    };

    $scope.previous = function(){
        if($scope.selector == 0){
            $scope.selector = events.length -1;
        }
        else {
            $scope.selector --;
        }
        $scope.selected = {
            event: $scope.events[$scope.selector]
        }
        console.log('going back ', $scope.selector, $scope.selected);
    }
})

app.controller('publicCtrl', ['$scope', '$http', function($scope, $http){
    $scope.message = 'velkommen til den offentlige afdeling';
}]);

