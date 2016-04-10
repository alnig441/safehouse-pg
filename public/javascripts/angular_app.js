var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ngAnimate', 'ngFileUpload']);

app.config(function($routeProvider, $locationProvider){
    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'singleViewModalCtrl'
        })
        .when('/admin/btle', {
            templateUrl: 'views/btle.html',
            controller: 'adminCtrl'
        })
        .when('/admin/diary', {
            templateUrl: 'views/diary.html',
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
        .otherwise({redirectTo: '/login'});
});

app.controller('logoutCtrl', function($scope, $location, $http){
    $scope.logout = function(){
        $http.get('/logout')
            .then(function(response){
                $location.path('/login');
            });
    };
});

app.controller('switchCtrl', function($scope, $rootScope){

    var menu = document.getElementsByClassName('collapse');

    $rootScope.template = {};

    $scope.templates = {
        accounts: './views/accounts.html',
        images: './views/images.html'
    };

    $scope.switch = function(option){
        $rootScope.template.url = $scope.templates[option];
        angular.element(menu).collapse('hide');
    };

});

app.controller('adminCtrl', ['$scope', '$rootScope', '$http', 'Upload', '$timeout', '$location', function($scope, $rootScope, $http, Upload, $timeout, $location){

    var forms = document.getElementsByTagName('form');
    var acct = document.getElementById('viewAcct');
    var event = document.getElementById('viewEvent');
    $rootScope.img = {};


    $scope.setLocation = function(option){

        if(option === 'btle'){
            $location.path('/admin/btle');
        }
        if(option === 'diary'){
            $location.path('/admin/diary');
        }
    };

    $scope.acct = [
        {name: 'acct_type', value: null},
        {name: 'Private', value: 'private'},
        {name: 'Public', value: 'public'},
        {name: 'Admin', value: 'admin'}
    ];

    $scope.speak = [
        {name: 'English', value: 'en'},
        {name: 'Danish', value: 'da'}
    ];


    $scope.addAcct = function(){
        var type = this.form.acct_type;
        $http.post('/admin_crud/add', this.form)
            .then(function(response){
                $scope.viewAcct(type, 'list');
                $scope.select('list');
            });
    };

    $scope.select = function(opt){

        this.selected_id = undefined;

        console.log('selecting: ', $rootScope.img);
        if($rootScope.img !== undefined){
            $scope.selected_id = $rootScope.img.id;
            console.log('bingosan', $scope.selected_id);
        }
        //else{
        //    $scope.selected_id = this.img.id;
        //}

        var x = 'active';
        var y = 'ng-hide';
        var list = document.getElementById('list');
        var add = document.getElementById('add');
        var list_div = document.getElementById('list_div');
        var add_div = document.getElementById('add_div');

        //console.log(list_div);

        $scope.selected = opt;
        if(opt === 'list'){
            angular.element(list).addClass(x);
            angular.element(add).removeClass(x);
            angular.element(add_div).addClass(y);
            angular.element(list_div).removeClass(y);
        }
        else if(opt === 'add'){
            angular.element(add).addClass(x);
            angular.element(list).removeClass(x);
            angular.element(list_div).addClass(y);
            angular.element(add_div).removeClass(y);
        }
        else if(opt === 'image'){
            angular.element(list).addClass(x);
            angular.element(add).removeClass(x);
            angular.element(add_div).addClass(y);
            angular.element(list_div).removeClass(y);
        }
        else if(opt === 'event'){
            angular.element(add).addClass(x);
            angular.element(list).removeClass(x);
            angular.element(list_div).addClass(y);
            angular.element(add_div).removeClass(y);
            $http.get('/event_crud/img_all')
                .then(function(response){
                    $scope.images = response.data;
                });
        }

    };

    $scope.viewAcct = function(acct, show){
        var type = acct || this.form.acct_type;
        $http.get('/admin_crud/'+ type)
            .then(function(response){
                $scope.users = response.data;
            });
    };

    $scope.delAcct = function(){
        var type = this.user.acct_type;
        $http.delete('/admin_crud/' + this.user.username)
            .then(function(response){
                $scope.viewAcct(type);
            });
    };

    $scope.addEvent = function(){
        console.log('addEvent: ', this.form, $rootScope.img, $scope.images);
        this.form.url = $rootScope.img.url;
        this.form.meta = $rootScope.img.meta;
        this.form.img_id = $rootScope.img.id || this.selected_id;

        console.log('HANSEN HER; ', this.form, typeof this.form);
        $http.post('/event_crud/add_event', this.form)
            .then(function(response){
                console.log(response.data);
            });
    };

    $scope.getEventById = function(){

        console.log('getEvById: ', $rootScope, this);
        var img_id;

        if(this.selected_id === undefined){
            img_id = $rootScope.img.id;
        }
        else{
            img_id = this.selected_id;
        }

        $http.get('/event_crud/get_one/' + img_id)
            .then(function(response){
                if(response.data.length !== 0){
                    $scope.form = response.data[0];
                }
                else{
                    $scope.form = {};
                }
            });

        if(this.selected_id === undefined){
            $scope.select('event');
        }
    };

}]);

app.controller('privDkCtrl', ['$scope','$rootScope', '$http', '$log', '$modal', '$location', function($scope, $rootScope, $http, $log, $modal, $location){
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

app.controller('singleViewModalCtrl', function($scope, $http, $modal, $rootScope, $location, Upload){
    $scope.animationsEnabled = true;
    $scope.open = function (size, option) {

        var contr;
        var templ;
        if(option === 'login'){
            contr = 'LoginModalCtrl';
            templ = 'loginModal.html';
        }
        else if(option === 'resume'){
            contr = 'ResumeModalCtrl';
            templ = 'resumeModal.html';
        }
        else if(option === 'modify'){
            contr = 'ModifyAcctModalCtrl';
            templ = 'modifyAcctModal.html';
        }
        else if(option === 'file'){
            contr = 'SaveImgModalCtrl';
            templ = 'saveImgModal.html';
        }
        else {
            contr = 'ModalInstanceCtrl';
            templ ='myModalContent.html';
        }

        var modalInstance = $modal.open({
            scope: $scope,
            animation: $scope.animationsEnabled,
            templateUrl: templ,
            controller: contr,
            size: size,
            resolve: {
                events: function () {
                    return $scope.event;
                }
            }
        });

    };

});

app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, $http) {

    $http.get('/event_crud/view')
        .then(function(response){
            $scope.event = response.data;

        });
    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    };

});


app.controller('LoginModalCtrl', function ($scope, $modalInstance, $http, $location) {

    $scope.submit = function(){

            $http.post('/login/authenticate', $scope.form)
                .then(function(response){
                    if(response.data.acct_type === 'admin'){
                        $location.path('/admin/diary');
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
                    else{$location.path('/login');}
                });

            $modalInstance.dismiss('cancel');
    };

    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    };

});

app.controller('ResumeModalCtrl', function($scope, $modalInstance, $http){

    $scope.download = function(){

    };

    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    };

});

app.controller('SaveImgModalCtrl', function($scope, $rootScope, $modalInstance, $http, Upload){

    $scope.uploadFiles = function(file, opt){

        $scope.img = {};
        $scope.img.url = file.name;
        $scope.img.meta = $scope.meta;
        $rootScope.f = file;

        if(file && !file.$error && opt) {
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

        $http.post('/event_crud/add_img', $scope.img)
            .then(function(response){
                $http.get('/event_crud/img')
                    .then(function(response){
                        $rootScope.img = response.data[0];
                    });
            });

        $modalInstance.dismiss('cancel');
        //$scope.getEventById();
        //$scope.select('event');

    };

});

app.controller('ModifyAcctModalCtrl', function($scope, $modalInstance, $http){

    $scope.submit = function(){

        if(this.user.new_password === $scope.user.confirm_password){
            $http.put('/admin_crud/chg', $scope.user)
                .then(function(response){
                    var alert = document.getElementById('alerts');
                    angular.element(alert).html(response.data);
                });
        }
        else {
            angular.element(document.getElementById('alerts')).html('password mismatch');
        }

        $modalInstance.dismiss('cancel');
    };

    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    };

});

app.controller('multiViewModalCtrl', function($scope, $rootScope, $http, $modal){

    $scope.animationsEnabled = true;
    $scope.open2 = function (size) {

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

    $scope.selector = 0;

    $scope.events = events;
    $scope.selected = {
        event: $scope.events[$scope.selector]
    };


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
        };
    };

    $scope.previous = function(){
        if($scope.selector === 0){
            $scope.selector = events.length -1;
        }
        else {
            $scope.selector --;
        }
        $scope.selected = {
            event: $scope.events[$scope.selector]
        };
    };
});

app.controller('publicCtrl', ['$scope', '$http', function($scope, $http){
    $scope.message = 'velkommen til den offentlige afdeling';
}]);

