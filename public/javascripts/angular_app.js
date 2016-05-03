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
            controller: 'privCtrl'
        })
        .when('/priv_dk', {
            templateUrl: 'views/priv_da.html',
            controller: 'privCtrl'
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

app.controller('adminCtrl', ['$scope', '$rootScope', '$http', 'Upload', '$timeout', '$location', '$interval', function($scope, $rootScope, $http, Upload, $timeout, $location, $interval){

    //IMAGE BATCH UPDATE TOOL

    //update_files();
    //
    //function update_files(){
    //
    //    var quantity = document.getElementById('new_files').getAttribute('data-value');
    //    console.log('update_files: ', quantity, $rootScope.new_files, document.getElementById('new_files').getAttribute('data-value'));
    //
    //        $http.get('/admin_crud/images/new_files')
    //            .then(function(response){
    //                if(quantity === undefined){
    //                    console.log('gummibamse', response.data, response.data.length);
    //                    document.getElementById('new_files').setAttribute('data-value', response.data.length);
    //                    $rootScope.new_files.quantity = response.data.length;
    //                    $rootScope.new_files.present = true;
    //                }
    //                else if(quantity < response.data.length){
    //                    console.log('gummiand: ', response.data, response.data.length);
    //                    document.getElementById('new_files').setAttribute('data-value', response.data.length);
    //                    $rootScope.new_files.quantity = response.data.length;
    //                    $rootScope.new_files.present = true;
    //                }
    //                else{
    //                    console.log('badebold: ', $rootScope.new_files.quantity);
    //                    //document.getElementById('new_files').setAttribute('data-value', quantity);
    //                    $rootScope.new_files.present = false;
    //                }
    //            });
    //        console.log('helledelle: ', $rootScope, document.getElementById('new_files').getAttribute('data-value'));
    //}


    $scope.update_images = function(){

        //BATCH UPDATE OF FILES
/*
        var stop = $interval(function(){

            $http.get('/admin_crud/images/files')
                .then(function(response){
                    console.log(response);
                    response.data.forEach(function(elem, ind, arr){
                        if(elem === 'zzz'){
                            $interval.cancel(stop);
                        }
                        var image = {};
                        image.file = elem;
                        console.log('FILE_NAME: ', image);

                        var stop2 = $timeout(function(){
                            $http.post('/admin_crud/images', image)
                                .then(function(response){
                                    console.log(response.data);
                                });
                            $timeout.cancel(stop2);
                        },2000);

                    });
                });

        }, 30000);

        console.log('..updating images..');
*/
        //API CALL TO UPDATE IMAGES file_name
/*
        var stop = $interval(function(){

            $http.get('/event_crud/img_all')
                .then(function(response){
                    var img = response.data;
                    if(img.file_name !== null){
                        $interval.cancel(stop);
                    }

                    else{
                        var temp = img.url.split('/');
                        img.name = temp[3];
                        $http.put('/event_crud/img_url', img)
                            .then(function(response){
                                console.log(response);
                            });
                    }

                });

        }, 250);
*/


    };

    var menu = document.getElementsByClassName('collapse');

    $rootScope.img = {};
    $rootScope.event_form = {};

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
        {name: 'Admin', value: 'admin'},
        {name: 'Superuser', value: 'superuser'}
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

        //console.log('selecting: ', $rootScope.selected_id, this.selected_id, $scope.selected_id);

        var x = 'active';
        var y = 'ng-hide';
        var list = document.getElementById('list');
        var add = document.getElementById('add');
        var list_div = document.getElementById('list_div');
        var add_div = document.getElementById('add_div');

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

        this.form = $rootScope.event_form;
        this.form.url = $rootScope.img.url;
        this.form.meta = $rootScope.img.meta;
        this.form.img_id = $rootScope.img.id || this.selected_id;
        this.form.updated = new Date();

        $http.post('/event_crud/add_event', this.form)
            .then(function(response){
                console.log(response.data);
            });
        this.form = {};
        $rootScope.event_form = {};
        $rootScope.img = {};
        $rootScope.f = {};
    };

    $scope.getEventById = function(id, x){

        if(x){
            $scope.select('event');
        }
        else{
            $http.get('/event_crud/img_get_one/' + id)
                .then(function(response){
                    $rootScope.img = response.data[0];
                });
        }
        var img_id = id;

        $http.get('/event_crud/get_one/' + img_id)
            .then(function(response){
                if(response.data.length !== 0){
                    $rootScope.event_form = response.data[0];

                }
                else{
                    $rootScope.event_form = {};

                }
            });

    };

    $scope.updateEvent = function(){

        $http.put('/event_crud', $rootScope.event_form)
            .then(function(response){
                console.log(response);
            });

        $rootScope.event_form = {};
        $rootScope.img = {};

    };

}]);

app.controller('privCtrl', ['$scope','$rootScope', '$http', '$log', '$modal', '$location', function($scope, $rootScope, $http, $log, $modal, $location){

    $scope.years = {};
    $scope.days = {};
    $scope.months = {};
    var menu = document.getElementsByClassName('collapse');
    angular.element(menu).collapse('hide');

    $scope.select = function(x){
        $scope.form = {};
        angular.element(menu).collapse('hide');
        $scope.selection = x;
        $scope.query =  {};
        $scope.query.option = 'year';
        $scope.query.database = x;

        $http.post('/search/dropdown', $scope.query)
            .then(function(response){
                $scope.years = response.data;
            });
    };

}]);


// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

app.controller('singleViewModalCtrl', function($scope, $http, $modal, $rootScope, $location, Upload){
    var menu = document.getElementsByClassName('collapse');


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
        else if(option === 'meta'){
            contr = 'AddTagsModalCtrl';
            templ = 'addTagsModal.html';
        }
        else {
            angular.element(menu).collapse('hide');
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

    $http.get('/search/latest')
        .then(function(response){
            $scope.event = response.data;
            console.log('this event: ', response.data);

        });
    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    };

});


app.controller('LoginModalCtrl', function ($scope, $modalInstance, $http, $location, $rootScope) {

    $rootScope.new_files = {};

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

app.controller('AddTagsModalCtrl', function($scope, $modalInstance, $http, $rootScope){

    $scope.submit = function(){

        $http.put('/event_crud/img_meta', $rootScope.img)
            .then(function(response){
            });

        $modalInstance.dismiss('cancel');

    };

    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    };
});

app.controller('SaveImgModalCtrl', function($scope, $rootScope, $modalInstance, $http, Upload, $timeout){

    $scope.uploadFiles = function(file, opt){

        console.log('uplaoding file: ', $scope, $rootScope, this);

        $scope.img = {};
        $scope.img.url = file.name;
        $scope.img.meta = $scope.meta;
        if($scope.created){
            $scope.img.created = $scope.created;
        }
        $rootScope.f = file;
        file.location = 'testing';
        console.log('show me that file: ', file);

        if(file && !file.$error && opt) {
            file.upload = Upload.upload({
                url: '/event_crud/upload/' + 'James',
                data: {file: file},
                method: 'PUT'
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
                        $http.get('/event_crud/img_all')
                            .then(function(response){
                                $scope.images = response.data;
                            });

                    });
            });

        $modalInstance.dismiss('cancel');

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
    $scope.open2 = function (size, db) {

        $scope.form.database = db;
        var temp = [];

        $http.post('/search/query', $scope.form)
            .then(function(response){
                $rootScope.events = response.data;
                console.log('himmerland: ', $rootScope.events);

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

        $scope.form = {};

    };

    $scope.getValues = function(option, db){

        //console.log('...jeller...', $scope, option);

        if(option === 'month') {
            //console.log('query: ' + $scope.query + ' form: ', $scope.form);
            $scope.form.option = false;
            $scope.form.day = false;
            $scope.form.month = false;
        }

        //console.log('form: ', $scope.form);
        $scope.query = {};
        $scope.query = $scope.form;
        $scope.query.option = option;
        $scope.query.database = db;

        $http.post('/search/dropdown', $scope.query)
            .then(function(response){
                if(response.data[0].da !== undefined){
                    $scope.months = response.data;
                }
                if(response.data[0].day !== undefined){
                    $scope.days = response.data;
                }
                //console.log('search/dropdown response: ', response.data, $scope);

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

