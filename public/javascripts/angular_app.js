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

app.controller('adminCtrl', ['$scope', '$rootScope', '$http', 'Upload', '$timeout', '$location', '$interval','appServices', function($scope, $rootScope, $http, Upload, $timeout, $location, $interval, appServices){

    //IMAGE BATCH UPDATE TOOL
    appServices.update_files();
    appServices.getUncategorisedImg();


    //function update_files(){
    //
    //    var elem =  document.getElementById('new_files');
    //    var show = 'ng-show';
    //
    //    $http.get('/image_jobs/count/' + $rootScope.default_storage)
    //        .then(function(result){
    //            $scope.img_db = result.data;
    //
    //            $http.get('/image_jobs/new_files/')
    //                .then(function(result){
    //                    if(parseInt(result.data.amount)  > parseInt($scope.img_db.size)){
    //                        console.log('new files in directory', result.data.amount);
    //                        angular.element(elem).removeClass('ng-hide');
    //                        angular.element(elem).addClass(show);
    //                    }
    //                    else{
    //                        console.log('no new files in directory', result.data.amount);
    //                    }
    //                });
    //        });
    //
    //
    //
    //}

    $scope.update_images = function(){

        //BATCH UPLOAD OF FILES
        var stop = $interval(function(){

            $http.get('/image_jobs/files')
                .then(function(response){
                    console.log(response);
                    response.data.forEach(function(elem, ind, arr){
                        if(elem === 'zzz'){
                            $interval.cancel(stop);
                        }
                        else{
                            var image = {};
                            image.file = elem;
                            console.log('FILE_NAME: ', image);

                            var stop2 = $timeout(function(){
                                $http.post('/image_jobs/load', image)
                                    .then(function(response){
                                        console.log(response.data);
                                        appServices.getUncategorisedImg();

                                    });
                                $timeout.cancel(stop2);
                            },500);
                        }

                    });
                });

        }, 5000);

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
        {name: 'select acct_type', value: null},
        {name: 'Private', value: 'private'},
        {name: 'Public', value: 'public'},
        {name: 'Admin', value: 'admin'},
        {name: 'Superuser', value: 'superuser'}
    ];

    $scope.speak = [
        {name: 'English', value: 'en'},
        {name: 'Danish', value: 'da'}
    ];

    $scope.addStorage = function(){

        $http.post('/storages_mgmt/add', this.form)
            .then(function(response){
            });
    };

    $scope.deleteStorage = function(){

        $http.put('/storages_mgmt/delete', this.storage)
            .then(function(response){
                appServices.getStorages();
        });
    };

    $scope.addAcct = function(){
        var type = this.form.acct_type;
        $http.post('/accounts_mgmt/add', this.form)
            .then(function(response){
                $scope.viewAcct(type, 'list');
                $scope.select('list');
            });
    };

    $scope.select = function(option){

        var elements = {list: ['list_div','new_image_div'], add: 'add_div', image: 'image_div', event: 'event_div', storage: 'storage_div'};
        appServices.selectTab(elements, option);

        if(option === 'event'){
            $http.get('/images_mgmt/get_all')
                .then(function(response){
                    $scope.images = response.data;
                });
        }


    };

    $scope.viewAcct = function(acct, show){
        var type = acct || this.form.acct_type;
        $http.get('/accounts_mgmt/'+ type)
            .then(function(response){
                $scope.users = response.data;
            });
    };

    $scope.delAcct = function(){
        var type = this.user.acct_type;
        $http.delete('/accounts_mgmt/' + this.user.username)
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

        $http.post('/events_mgmt/add', this.form)
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
            $http.get('/images_mgmt/get_one/' + id)
                .then(function(response){
                    $rootScope.img = response.data[0];
                });
        }
        var img_id = id;

        $http.get('/events_mgmt/' + img_id)
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

        $http.put('/events_mgmt', $rootScope.event_form)
            .then(function(response){
            });

        $rootScope.event_form = {};
        $rootScope.img = {};

    };

}]);

app.controller('privCtrl', ['$scope','$rootScope', '$http', '$log', '$modal', '$location','appServices', function($scope, $rootScope, $http, $log, $modal, $location, appServices){

    appServices.resetSQ();

    /*BLOCKED OUT FUNTIONALITY FOR USE WHEN MORE STORAGE FOLDERS ARE ACTIVE PER USER*/
    $scope.selected_db = $rootScope.default_storage;

    getCount($scope.selected_db);

    $scope.setActive = function(){
        getCount($scope.selected_db);
    };

    function getCount(db){
        $http.get('/image_jobs/count/' + db)
            .then(function(result){
                $rootScope.img_db = result.data;
            });
    }

    $scope.switch = function(option){
        $scope.form.type_and = true;
        var elements = {meta: 'meta_div', time: 'time_div'};
        appServices.selectTab(elements, option);

        if(option === 'meta'){
            appServices.buildMeta();
        }
    };

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

        $http.post('/dropdowns/build', $scope.query)
            .then(function(response){
                $scope.years = response.data;
            });
    };

    $scope.build_query = function(x) {

        console.log('hvad kommer ind: ',this.form);

        var query = {};


        if(this.form[x] !== null && this.form[x] !== undefined){

            if (Object.keys($rootScope.baseline).length === 0) {
                $rootScope.baseline[x] = this.form[x];
                if(this.form.exclude){
                    $rootScope.baseline_type = 'exclude';
                }
            }
            else {
                if (this.form.type_and && this.form[x] !== null) {
                    query.contract = {};
                    query.contract[x] = this.form[x];
                }
                if (this.form.type_or && this.form[x] !== null) {
                    query.expand = {};
                    query.expand[x] = this.form[x];
                }
                if (this.form.exclude && this.form[x] !== null) {
                    query.exclude = {};
                    query.exclude[x] = this.form[x];
                }

            }

            query.baseline = $rootScope.baseline;

            if (($rootScope.search_terms.contract[x] === undefined && this.form.type_and) || ($rootScope.search_terms.expand[x] === undefined && this.form.type_or) || ($rootScope.search_terms.exclude[x] === undefined && this.form.exclude)) {
                if (this.form.type_and && this.form[x] !== null) {
                    $rootScope.search_terms.contract[x] = [];
                    $rootScope.search_terms.contract[x].push(this.form[x]);
                }
                if (this.form.type_or && this.form[x] !== null) {
                    $rootScope.search_terms.expand[x] = [];
                    $rootScope.search_terms.expand[x].push(this.form[x]);
                }
                if (this.form.exclude && this.form[x] !== null) {
                    $rootScope.search_terms.exclude[x] = [];
                    $rootScope.search_terms.exclude[x].push(this.form[x]);
                }

            }
            else {
                if (this.form.type_and && this.form[x] !== null) {
                    $rootScope.search_terms.contract[x].push(this.form[x]);
                }
                if (this.form.type_or && this.form[x] !== null) {
                    $rootScope.search_terms.expand[x].push(this.form[x]);
                }
                if (this.form.exclude && this.form[x] !== null) {
                    $rootScope.search_terms.exclude[x].push(this.form[x]);
                }
            }

            console.log('search terms: ', $rootScope.search_terms);

            appServices.buildMeta(query);

        }

    };

}]);


// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

app.controller('singleViewModalCtrl', function($scope, $http, $modal, $rootScope, $location, Upload, appServices){
    var menu = document.getElementsByClassName('collapse');

    $scope.animationsEnabled = true;
    $scope.open = function (size, option, status) {

        var modal = appServices.setModal(option);

        if(option === 'event'){
            angular.element(menu).collapse('hide');
        }

        if(status === 'new'){
            $scope.img = this.uncategorized;
        }

        var modalInstance = $modal.open({
            scope: $scope,
            animation: $scope.animationsEnabled,
            templateUrl: modal.templ,
            controller: modal.contr,
            size: size,
            resolve: {
                events: function () {
                    return $scope.event;
                }
            }
        });

    };

    $scope.deleteImg = function(){
        $http.delete('/images_mgmt/' + this.uncategorized.id)
            .then(function(response){
                console.log('response from delete call: ', response);
                appServices.getUncategorisedImg();
                appServices.update_files();
            });
    };

});

app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, $http) {

    $http.get('/queries/latest')
        .then(function(response){
            $scope.event = response.data;
            console.log('this event: ', response.data);

        });
    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    };

});


app.controller('LoginModalCtrl', function ($scope, $modalInstance, $http, $location, $rootScope, appServices) {

    $rootScope.new_files = {};

    $scope.submit = function(){

            $http.post('/login/authenticate', $scope.form)
                .then(function(response){
                    if(response.data.acct_type === 'admin'){
                        appServices.getStorages();
                        $rootScope.default_storage = response.data.storages[0];
                        $location.path('/admin/diary');
                    }
                    else if(response.data.acct_type === 'private' && response.data.lang === 'en'){
                        $rootScope.storages = response.data.storages;
                        $rootScope.default_storage = $rootScope.storages[0];
                        $location.path('/priv_uk');
                    }
                    else if(response.data.acct_type === 'private' && response.data.lang === 'da'){
                        $rootScope.storages = response.data.storages;
                        $rootScope.default_storage = $rootScope.storages[0];
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

app.controller('AddTagsModalCtrl', function($scope, $modalInstance, $http, $rootScope, appServices){


    $scope.submit = function(){

        console.log('in adding meta. \nrootscope.img: '+  $rootScope.img + '\nthis.uncategorzised: '+ this.uncategorized);

        if(!$rootScope.img.id){
            $rootScope.img.id = this.uncategorized.id;
        }

        if($rootScope.img.state === undefined){
            $rootScope.img.state = 'n/a';
        }

        $http.put('/images_mgmt/add_meta', $rootScope.img)
            .then(function(response){
                appServices.getUncategorisedImg('add tags');
            });

        $rootScope.img = {};
        $modalInstance.dismiss('cancel');

    };

    $scope.cancel = function(){
        $rootScope.img = {};
        $modalInstance.dismiss('cancel');
    };
});

app.controller('SaveImgModalCtrl', function($scope, $rootScope, $modalInstance, $http, Upload, $timeout){

    $scope.uploadFiles = function(file, opt){

        //console.log('uplaoding file: ', $scope, $rootScope, this);

        $scope.img = {};
        $scope.img.url = file.name;
        $scope.img.meta = $scope.meta;
        if($scope.created){
            $scope.img.created = $scope.created;
        }
        $rootScope.f = file;

        if(file && !file.$error && opt) {
            file.upload = Upload.upload({
                url: '/images_mgmt/upload/' + $rootScope.default_storage,
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

        $http.post('/images_mgmt/add', $scope.img)
            .then(function(response){
                $http.get('/images_mgmt/get_latest')
                    .then(function(response){
                        $rootScope.img = response.data[0];
                        $http.get('/images_mgmt/get_all')
                            .then(function(response){
                                $scope.images = response.data;
                            });

                    });
            });

        $modalInstance.dismiss('cancel');

    };

});

app.controller('ModifyAcctModalCtrl', function($scope, $modalInstance, $http, appServices){

    appServices.getStorages();

    $scope.submit = function(option){

        if(option !== undefined){

            this.user.option = option;

            $http.put('/accounts_mgmt/modify_storage',this.user)
                .then(function(response){
                    $scope.viewAcct(response.config.data.acct_type);
                });

            $modalInstance.dismiss('cancel');
        }

        else{

            if(this.user.new_password === $scope.user.confirm_password){
                $http.put('/accounts_mgmt/chg', $scope.user)
                    .then(function(response){
                        var alert = document.getElementById('alerts');
                        angular.element(alert).html(response.data);
                    });
            }
            else {
                angular.element(document.getElementById('alerts')).html('password mismatch');
            }

            $modalInstance.dismiss('cancel');

        }

    };

    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    };

});

app.controller('ModifyStorageModalCtrl', function($scope, $modalInstance, $http, $rootScope, appServices){

    $scope.submit = function(option){

        console.log('adding: ', $scope.form);

        if(option === 'add'){
            $http.post('/storages_mgmt/add', $scope.storage)
                .then(function(response){
                    appServices.getStorages();
                });
        }

        if(option === 'modify'){
            console.log('modifying this ', this.form);
            $http.put('/storages_mgmt/update', this.storage)
                .then(function(response){
                    appServices.getStorages();
                });
        }

        $modalInstance.dismiss('cancel');
    };

    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    };

});

app.controller('multiViewModalCtrl', function($scope, $rootScope, $http, $modal, appServices){
    $scope.animationsEnabled = true;

    $scope.open2 = function (size, db, type) {

        var obj = {};
        var arr = [];

        if(appServices.getConditions() !== undefined){
            arr = appServices.getConditions().split(' ');
        }

        if(type === 'meta' && arr[0] !== undefined){
            if(arr[0].toLowerCase() !== 'select'){
                obj.query = "select id, path || folder || '/' || file as url from (select * from images where meta is not null "+ appServices.getConditions() +") as x cross join storages where folder = x.storage order by created asc";
            }
            else{
                obj.query = "select id, path || folder || '/' || file as url from ("+ appServices.getConditions()+ ") as x cross join storages where folder = x.storage order by created asc";
                obj.query = obj.query.replace(/COLUMN/g, "*");
            }
        }
        else{
            $scope.form.database = db;
            obj = $scope.form;
        }

        console.log('open2 - query object: ', JSON.stringify(obj.query));

        //$scope.form.database = db;
        var temp = [];

        $http.post('/queries', obj)
            .then(function(response){
                $rootScope.events = response.data;

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

        $scope.clear();


    };

    $scope.getValues = function(option, db){

        if(option === 'month') {
            $scope.form.option = false;
            $scope.form.day = false;
            $scope.form.month = false;
        }

        $scope.query = {};
        $scope.query = $scope.form;
        $scope.query.option = option;
        $scope.query.database = db;

        $http.post('/dropdowns/build', $scope.query)
            .then(function(response){
                if(response.data[0].da !== undefined){
                    $scope.months = response.data;
                }
                if(response.data[0].day !== undefined){
                    $scope.days = response.data;
                }

            });

    };

    $scope.clear = function(){

        $scope.form = {};
        $scope.form.type_and = true;
        $scope.form.type_or = false;
        $scope.form.exclude = false;
        appServices.resetSQ();
        appServices.buildMeta();

    };
});

app.controller('ModalInstanceCtrl2', function($scope, $modalInstance, events, $rootScope) {

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

app.factory('appServices', ['$http', '$rootScope', function($http, $rootScope){

    var _appServicesFactory = {};
    var excl_incr;
    var conditions;

    var modals = {
        login: {contr: 'LoginModalCtrl', templ: 'loginModal.html'},
        modify: {contr:'ModifyAcctModalCtrl', templ: 'changePWModal.html'},
        resume: {contr: 'ResumeModalCtrl', templ: 'resumeModal.html'},
        file: {contr : 'SaveImgModalCtrl', templ: 'saveImgModal.html'},
        meta: {contr: 'AddTagsModalCtrl', templ: 'addTagsModal.html'},
        storage: {contr: 'ModifyAcctModalCtrl', templ: 'manageStoragesModal.html'},
        modify_storage: {contr: 'ModifyStorageModalCtrl', templ: 'modifyStorageModal.html'},
        add_storage: {contr: 'ModifyStorageModalCtrl', templ: 'addStorageModal.html'},
        event: {contr: 'ModalInstanceCtrl', templ: 'myModalContent.html'}
    };

    _appServicesFactory.getStorages = function(){

        $http.get('/storages_mgmt/all')
            .then(function(response){
                $rootScope.storages = response.data;
            });
    };

    _appServicesFactory.setModal = function(option){

        return modals[option];

    };

    _appServicesFactory.buildMeta = function(obj){

        var arr = ['names', 'meta', 'country', 'state', 'city', 'occasion'];

        var column;
        var type;
        var key_value;
        var baseline_col = Object.keys($rootScope.baseline).toString();

        for(var prop in obj){
            if(prop !== 'baseline'){
                column = Object.keys(obj[prop]).toString();
                type = prop;
                key_value = obj[prop];
            }
        }

        console.log('give me type: '+ type + '\nand object: '+ JSON.stringify(obj));

        switch(type){
            case 'contract':
                if(column !== 'names' && column !== 'meta'){
                    conditions += ' AND '+ Object.keys(key_value).toString() +' = xxx'+ key_value[Object.keys(key_value).toString()] +'xxx';
                }
                else{
                    conditions += ' AND xxx'+ key_value[Object.keys(key_value).toString()] +'xxx = ANY('+ Object.keys(key_value).toString() +')';
                }
                break;
            case 'expand':
                if(column !== 'names' && column !== 'meta'){
                    conditions+= ' OR '+ Object.keys(key_value).toString() +' = xxx'+ key_value[Object.keys(key_value).toString()] +'xxx';
                }
                else{
                    conditions+= ' OR xxx'+ key_value[Object.keys(key_value).toString()] +'xxx = ANY('+ Object.keys(key_value).toString() +')';
                }
                break;
            case 'exclude':
                if(column !== 'names' && column !== 'meta' && excl_incr <1){
                    conditions = 'SELECT DISTINCT RES'+excl_incr+'.COLUMN FROM (SELECT * FROM IMAGES WHERE META IS NOT NULL '+conditions+') AS RES'+excl_incr+' WHERE '+column+' != xxx'+key_value[column]+'xxx';
                    excl_incr ++;
                    $rootScope.exlc_incr ++;
                }
                else{
                    conditions = conditions.replace(/RES\w.COLUMN/g, "ASTERIX");
                    console.log('hansen cond: ', conditions);
                    conditions = 'SELECT DISTINCT RES'+excl_incr+'.* FROM ('+conditions+') as RES'+excl_incr+' where '+column+ ' != xxx'+key_value[column]+'xxx';
                    excl_incr ++;
                }
                break;
            case undefined:
                if($rootScope.baseline_type === 'exclude'){
                    conditions = ' AND ' +baseline_col+ ' != xxx'+ $rootScope.baseline[baseline_col] +'xxx';
                }
                else{
                    if(baseline_col==='names' || baseline_col==='meta'){
                        conditions = ' AND xxx'+ $rootScope.baseline[baseline_col] +'xxx = ANY('+ baseline_col +')';
                    }
                    else if(baseline_col){
                        conditions = ' AND ' +baseline_col+ ' = xxx'+ $rootScope.baseline[baseline_col] +'xxx';
                    }
                }
                break;
        }

        console.log('buildMeta OBJ: \nobject: '+JSON.stringify(obj)+'\ntype: '+type+'\nexclude conditions: '+$rootScope.exclude+'\ncolumn: '+column+'\nbasline_col: '+ baseline_col +'\nsending conditions: '+JSON.stringify(conditions));

        $http.get('/dropdowns/'+ conditions)
            .then(function(result){
                $rootScope.meta = result.data;
                console.log('result build: ', $rootScope.meta);
            });

        $http.put('/queries/count', {conditions: conditions})
            .then(function(response){
                console.log('count: ', response.data[0].count);
                $rootScope.queries_count = response.data[0].count;
            });

    };

    _appServicesFactory.selectTab = function(elements, option){

        for(var prop in elements){
            if(prop !== option){
                angular.element(document.getElementById(prop)).removeClass('active');
                angular.element(document.getElementById(elements[prop])).addClass('ng-hide');
            }
            else{
                angular.element(document.getElementById(prop)).addClass('active');
                angular.element(document.getElementById(elements[prop])).removeClass('ng-hide');
            }
        }

    };

    _appServicesFactory.resetSQ = function(){
        $rootScope.baseline = {};
        $rootScope.baseline_type = '';
        $rootScope.queries_count = '';
        $rootScope.search_terms = {};
        $rootScope.search_terms.contract = {};
        $rootScope.search_terms.expand = {};
        $rootScope.search_terms.exclude = {};
        conditions = undefined;
        excl_incr = 0;
        $rootScope.exlc_incr = 0;
    };

    _appServicesFactory.getConditions = function(){

        return conditions;
    };

    _appServicesFactory.getUncategorisedImg = function(str){

        console.log(str);

        $http.get('/images_mgmt/get_new')
            .then(function(response){
                $rootScope.uncategorized = response.data;
            });
    };

    _appServicesFactory.update_files = function(){

        var elem =  document.getElementById('new_files');
        var show = 'ng-show';

        $http.get('/image_jobs/count/' + $rootScope.default_storage)
            .then(function(result){
                $rootScope.img_db = result.data;

                $http.get('/image_jobs/new_files/')
                    .then(function(result){
                        if(parseInt(result.data.amount)  > parseInt($rootScope.img_db.size)){
                            console.log('new files in directory', result.data.amount);
                            angular.element(elem).removeClass('ng-hide');
                            angular.element(elem).addClass(show);
                        }
                        else{
                            console.log('no new files in directory', result.data.amount);
                        }
                    });
            });



    };


    return _appServicesFactory;

}]);

