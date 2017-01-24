var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ngAnimate', 'ngFileUpload', 'simpleAngularTicker']);

app.config(function($routeProvider, $locationProvider){

    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'singleViewModalCtrl'
        })
        .when('/admin/btle', {
            templateUrl: 'views/btle.html',
            controller: 'locationCtrl'
        })
        .when('/admin/diary', {
            templateUrl: 'views/diary.html',
            controller: 'locationCtrl'
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
        .otherwise({
            redirectTo: '/login'
        });
});

app.run(['loadServices','$rootScope', function(loadServices, $rootScope){

    $rootScope.tickers = {Allan: [{headline: '', copy: '', created_str: ''}], Fiona: [{headline: '', copy: '', created_str: ''}]};

    loadServices.getBios();
    loadServices.getTickers();
    loadServices.getProjects();

}]);;app.filter('capInitial', function(){

    return function(input) {

        console.log('cap filter; ', input, typeof input);

        var output;
        var outArr = [];
        var inputArr = [];
        var result = [];

        if(Array.isArray(input)){
            inputArr = input;
            output = inputArr.forEach(capitalize);
        }
        else {
            input = input.toLowerCase();
            inputArr = input.split(',');
            inputArr.forEach(elemIsArray);
        }

        output = inputArr.join(',');

        return output;
    };

});

app.filter('mapTabs', function(){

    return function (input){

        var output = input;

        var mapping = {
            indholdsbaseret: 'content',
            tidsafgrænset: 'point-in-time'
        };

        for(var prop in mapping){
            if(prop == input){
                output = mapping[prop];
            }
        }

        return output;
    }

});

app.filter('dotFilter', function(){

    return function(input){

        var str = input.replace(/,/g, /&sdot;/);

        return str;
    }
});

function elemIsArray(elem, index, array){

    var outArr = [];
    var outStr;

    elem = elem.trim();

    if(Array.isArray(elem.split(' ')) && elem.split(' ').length > 1){

        var tmp = elem.split(' ');
        tmp.forEach(capitalize);
        array[index] = tmp.join(' ');
    }
    else {
        elem = capitalize(elem);
        array[index] = elem.toString();
    }

    outStr = array.join(',');

    return outStr;

}

function capitalize (elem, ind, arr){

    elem = elem.trim();
    var out;

    arr ? out = arr : out = undefined;

    var tmp = [];
    var x = '';

    if((elem === 'of' || elem === 'the' ) && ind != 0){
        console.log('avoid at all costs');
    }
    else{
        for(var i = 0 ; i <= elem.length ; i ++){
            tmp.push(elem[i]);
        }

        x = tmp[0].toUpperCase();
        tmp.shift();
        tmp.unshift(x);
        elem = tmp.join('');
    }



    if(arr){
        arr[ind] = elem;
    }
    else {
        arr = [];
        arr.push(elem);
    }

    return arr;

};app.controller('acctsCtrl',['accountServices', '$scope', 'appServices', '$http', function(accountServices, $scope, appServices, $http){

    console.log('accounts ctrl');

    $scope.acct = [
        {name: '<<acct_type>>', value: null},
        {name: 'Private', value: 'private'},
        {name: 'Public', value: 'public'},
        {name: 'Admin', value: 'admin'},
        {name: 'Superuser', value: 'superuser'}
    ];

    $scope.lang = [
        {name: '<<language>>', value: null},
        {name: 'English', value: 'en'},
        {name: 'Danish', value: 'da'}
    ];

    $scope.getValues = function(){



    };


    $scope.addAcct = function(){

        accountServices.addAcct(this.form);

        appServices.selectTab('list');

    };

    $scope.viewAcct = function(){

        accountServices.viewAcct(this.form.acct_type, $scope);

    };

    $scope.delAcct = function(){

        accountServices.deleteAcct(this.user);
    };

}]);
;app.controller('AddTagsModalCtrl', ['imageServices', 'capInitialFilter', '$scope', '$modalInstance', '$http', '$rootScope', 'appServices', function(imageServices, capInitialFilter, $scope, $modalInstance, $http, $rootScope, appServices){

    $scope.submit = function(){

        if($scope.batchObj.hasOwnProperty(this.img.id)){

            $scope.batchObj[this.img.id] = false;

            var incr = 0;
            for(var prop in $scope.batchObj){
                if($scope.batchObj[prop]){
                    incr ++;
                }
            }

            if(incr == 0){
                $scope.batch.all = false;
            }
        }

        imageServices.addTags(this.img);

        $modalInstance.dismiss('cancel');

    };

    $scope.cancel = function(){
        $rootScope.img = {};
        $modalInstance.dismiss('cancel');
    };
}]);
;app.controller('BatchEditModalCtrl', ['imageServices', 'capInitialFilter', '$scope', '$modalInstance', '$http', '$rootScope', 'appServices', function(imageServices, capInitialFilter, $scope, $modalInstance, $http, $rootScope, appServices){

    $scope.submit = function(){

        console.log('batch edit scope; ',$scope);

        if(this.batchEdit){
            this.batchEdit.id = $scope.ids;
            imageServices.batchEdit(this.batchEdit);
        }

        $modalInstance.dismiss('cancel');

    };

    $scope.delete = function(){

        imageServices.deleteImages($scope.ids);

        $modalInstance.dismiss('cancel');
    }

    $scope.cancel = function(){
        $rootScope.img = {};
        $modalInstance.dismiss('cancel');
    };
}]);
;app.controller('imageCtrl', ['storageServices', 'eventServices', 'imageServices', '$scope', '$rootScope', '$http', 'Upload', '$timeout', '$location', '$interval','appServices', function(storageServices, eventServices, imageServices, $scope, $rootScope, $http, Upload, $timeout, $location, $interval, appServices){

    imageServices.getNewImages($scope);
    imageServices.getAll($scope);
    eventServices.getAllEvents($scope);

    $scope.tools = [
        { name: 'import', value: 'loadNewImages' },
        { name: 'update', value: 'checkExif' }
    ];

    $scope.activeTool = $scope.tools[0].value;

    $scope.toolSelector = function(selectedTool){

        $scope.activeTool = selectedTool;

    };

    $scope.runTool = function(){

        //$rootScope[$scope.activeTool]();
        $scope[$scope.activeTool]();
    };


    //REWRITE THE FOLLOWING FOR QA....

    $scope.checkExif = function() {

        console.log('exiffing');

        function getIndex () {
            var i = 0;
            var element;


            while(i < $scope.images.length){
                if($scope.images[i].meta[$scope.images[i].meta.length -1].toLowerCase() != 'checked' && $scope.images[i].meta[$scope.images[i].meta.length -1].toLowerCase() != 'updated'){
                    break;
                }
                i++;
            }
            if($scope.images[i]){
                return i.toString();
            }else {
                return false;
            }
        }

        var index = getIndex();

        if(!index){
            var images = [];
            $scope.images.forEach(function(elem,ind){
                if(elem.meta[elem.meta.length -1] === 'checked'){
                    images.push(elem);
                }

            })
        }

        if (index){
            $http.get('/exif/' + $scope.images[index].file)
                .then(function(response){

                    if(response.data.created){

                        var coord = response.data.coordinates;

                        for(var prop in $scope.images[index]){
                            if(prop != 'id' && prop != 'meta'){
                                $scope.images[index][prop] = false;
                            }
                        }

                        $scope.images[index].created = response.data.created;

                        $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + response.data.coordinates + '&key=' + response.data.API_KEY)
                            .then(function(response){

                                console.log('api status: ', response.data.status);

                                if(response.data.status === 'OK'){

                                    $scope.images[index] = imageServices.buildImageObject($scope.images[index], response.data.results[0].address_components);

                                }
                                if(coord && response.data.status === 'ZERO_RESULTS'){

                                    $scope.images[index].country = 'En Route';
                                    $scope.images[index].state = 'N/a';
                                    $scope.images[index].city = 'En Route';

                                }
                                //ADD AND 'UPDATED' FLAG TO IMAGE IN THE DATABASE
                                $scope.images[index].meta.push('updated');

                                $http.put('/images_mgmt/add_meta', $scope.images[index])
                                    .then(function(response){
                                        $scope.checkExif();
                                    })

                            })
                    }
                    else {
                        //ADD A 'CHECKED' FLAG TO THE IMAGE ON ROOTSCOPE
                        $scope.images[index].meta.push('checked');
                        $scope.checkExif();
                    }
                })

        }
    };

    $scope.loadNewImages = function() {

        var image = {};
        image.file = get_next_img();
        image.storage = $rootScope.default_storage;

        if(image.file) {
            imageServices.addImg(image, true, $scope);
        }
    };

    //GET NEXT NEW IMAGE

    function get_next_img() {
        for(var prop in $scope.newImages){
            if($scope.newImages[prop] === true){
                return prop;
            }
        }
    }

    $scope.batchObj = {};
    $scope.batch = {};

    $scope.deleteImg = function(){

        if($scope.batchObj.hasOwnProperty(this.uncategorized.id)){
            $scope.batchObj[this.uncategorized.id] = false;
            if(Object.keys($scope.batchObj).length == 1){
                $scope.batch.all = false;
            }
        }

        imageServices.deleteImages(this.uncategorized.id);

    };

    $scope.mngBatchObj = function(){

        if(!$scope.batch.all){
            $scope.batchObj = {};
        }
        else {
            for(var prop in $rootScope.uncategorized){
                $scope.batchObj[$rootScope.uncategorized[prop].id] = true;
            }
        }
    };

    var menu = document.getElementsByClassName('collapse');

    $rootScope.img = {};
    $rootScope.event_form = {};

    //HAS BEEN ADDED TO storagesCtrl

    $scope.deleteStorage = function(){

        storageServices.deleteStorage(this.storage.folder);
    };

    $scope.getEventById = function(){

        var id = this.event_form.img_id;
        $rootScope.img = {};
        eventServices.getEventById(id);
        imageServices.getImgById(id);

    };

    $scope.updateEvent = function(){

        console.log('hvad kommer ved update; ', this.form, this.event_form);
        eventServices.updateEvent($rootScope.event_form);

    };

    $scope.getImgById = function(id){

        imageServices.getImgById(id);

    };

}]);
;app.controller('indexCtrl',['$location', '$http', '$rootScope', '$scope','$global','getGlobals', function($location, $http, $rootScope, $scope, $global, getGlobals){

    switch ($location.$$hash) {
        case 'about_allan':
            angular.element(document.getElementsByClassName('content-section-b allan')).css('border-bottom', '0px');
            angular.element(document.getElementsByClassName('fiona')).addClass('ng-hide');
            break;
        case 'about_fiona':
            angular.element(document.getElementsByClassName('allan')).addClass('ng-hide');
            break;
        default :
            $location.path('/login');
            break;
    }

}]);
;app.controller('landingPageCtrl', ['$scope', '$http', '$rootScope', 'appServices', 'landingPageServices', function($scope, $http, $rootScope, appServices, landingPageServices){

    $scope.postItem = function(){

        if(this.form.date === null){
            this.form.date = new Date();
        }

        this.form.date_str = this.form.date.toDateString();

        landingPageServices.postTicker(this.form);

        $scope.form = {};

    };

    $scope.postProject = function(){

        $rootScope.load = undefined;

        landingPageServices.postProject(this.form);

        $scope.form = {};

    };

    $scope.getBio = function(){

        landingPageServices.getBio(this.form.owner);

        $scope.form = $rootScope.subjects[this.form.owner];

    };

    $scope.addBio = function(){

        landingPageServices.postBio(this.form);

        $scope.form = {};
    };

    $scope.owners = [
        {name: 'Allan', value: 'Allan'},
        {name: 'Fiona', value: 'Fiona'}
    ];

}]);
;app.controller('locationCtrl', ['$scope', '$rootScope', '$location', 'appServices',  function($scope, $rootScope, $location, appServices){

    var menu = document.getElementsByClassName('collapse');

    $rootScope.captions = {
        images: 'Images',
        accounts: 'Accounts',
        'landing_page': 'Landing Page'
    };

    $rootScope.caption = $rootScope.captions.images;
    $rootScope.template = {};
    $rootScope.template.url = './views/images.html';

    $scope.templates = {
        accounts: './views/accounts.html',
        images: './views/images.html',
        landing_page: './views/landing-page.html'
    };

    $scope.switch = function(option){

        console.log('location ctrl switching to ', option);
        $rootScope.caption = $rootScope.captions[option];
        $rootScope.template.url = $scope.templates[option];
        angular.element(menu).collapse('hide');
    };

    $scope.setLocation = function(option){

        if(option === 'btle'){
            $location.path('/admin/btle');
            $rootScope.template = {};
        }
        if(option === 'diary'){
            $location.path('/admin/diary');
        }
    };

    $scope.select = function(choice){

        appServices.selectTab(choice.toLowerCase());
    };

}]);
;app.controller('LoginModalCtrl', function ($scope, $modalInstance, $http, $location, $rootScope, appServices, storageServices, imageServices, eventServices) {

    $rootScope.new_files = {};

    $scope.submit = function(){

        $http.post('/login/authenticate', $scope.form)
            .then(function(response){
                if(response.data.acct_type === 'admin'){
                    storageServices.getStorages();
                    imageServices.getUncategorisedImg();
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
;app.controller('logoutCtrl', function($scope, $location, $http){
    $scope.logout = function(){
        $http.get('/logout')
            .then(function(response){
                $location.path('/login');
            });
    };
});
;app.controller('ModalInstanceCtrl2', function($scope, $rootScope, $modalInstance, events, $interval) {

    $scope.selector = 0;

    $scope.events = events;
    $scope.selected = {
        event: $scope.events[$scope.selector]
    };

    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    };

    $scope.play = function(bool){

        if(!$scope.interval){
            $scope.interval = $interval(function(){
                $scope.next();
            }, 5000)
        }

        else{
            $interval.cancel($scope.interval);
            $scope.interval = false;
        }

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
;app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, $http) {

    //$http.get('/queries/latest')
    //    .then(function(response){
    //        if(response.data.length > 0){
    //            console.log('whats going on: ',response.data);
    //            $scope.event = response.data;
    //        } else {
    //            $modalInstance.dismiss('cancel');
    //        }
    //    });
    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    };

});
;app.controller('ModifyAcctModalCtrl', function($scope, $modalInstance, $http, storageServices){

    storageServices.getStorages();

    $scope.submit = function(option){

        if(option){

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
;app.controller('ModifyStorageModalCtrl', function($scope, $modalInstance, $http, $rootScope, appServices, storageServices){

    $scope.submit = function(option){

        if(option === 'add'){
            storageServices.addStorage(this.storage);
        }

        if(option === 'modify'){
            storageServices.modifyStorage(this.storage);
        }

        $modalInstance.dismiss('cancel');
    };


    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    };

});
;app.controller('multiViewModalCtrl', function($scope, $rootScope, $http, $modal, appServices){

    $scope.animationsEnabled = true;

    $scope.open2 = function (size, type) {

        var modal = appServices.setModal('multi');

        var obj = {};
        var arr = [];

        if(appServices.getConditions()){
            arr = appServices.getConditions().trim().split(' ');
        }

        if(type === 'meta' && arr[0]){
            if(arr[0].toLowerCase() !== 'select'){
                obj.query = "select id, created, path || folder || '/' || file as url from (select * from images where meta is not null "+ appServices.getConditions() +") as x cross join storages where folder = x.storage order by created asc";
            }
            else{
                obj.query = "select id, created, path || folder || '/' || file as url from ("+ appServices.getConditions()+ ") as x cross join storages where folder = x.storage order by created asc";
                obj.query = obj.query.replace(/COLUMN/g, "*");
            }
        }
        else{
            $scope.form.table = $rootScope.active_table;
            obj = $scope.form;
        }

        var temp = [];

        $http.post('/queries', obj)
            .then(function(response){
                $rootScope.events = response.data;

            })
            .then(function(){
                if($rootScope.events.length >0){
                    var modalInstance = $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: modal.templ,
                        controller: modal.contr,
                        size: size,
                        resolve: {
                            events: function () {
                                return $rootScope.events;
                            }
                        }
                    });
                }

            });

        $scope.clear();


    };

});
;app.controller('privCtrl', ['mapTabsFilter','$scope','$rootScope', '$http', '$log', '$modal', '$location','appServices', 'imageServices', 'eventServices', function(mapTabsFilter, $scope, $rootScope, $http, $log, $modal, $location, appServices, imageServices, eventServices ){

    imageServices.getDbCount($scope);
    eventServices.getLatestEvent($scope);

    //RUN priv_load() TO POPULATE THE SELECT OPTIONS IN POINT-IN-TIME SEARCH FORM  WWIH THE APPROPRIATE VALUES
    priv_load();

    function priv_load () {

        console.log('running priv_load');

        $scope.form = {};
        $scope.query = {};
        $scope.query.option = 'year';
        $scope.query.table = 'images';

        $http.post('/dropdowns/build', $scope.query)
            .then(function(response){
                $scope.years = response.data;
            });

    };

    //DO NOT REMOVE - ENSURES SOUND REQ.BODY ON LOAD
    $rootScope.active_table = 'images';

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

    $scope.years = {};
    $scope.days = {};
    $scope.months = {};
    var menu = document.getElementsByClassName('collapse');
    angular.element(menu).collapse('hide');

    $scope.select = function(choice){

        choice = mapTabsFilter(choice.toLowerCase());

        appServices.selectTab(choice);

        if(choice === 'event'){
            $http.get('/images_mgmt/get_all')
                .then(function(response){
                    $scope.images = response.data;
                });
        }

        if(choice === 'content'){
            $scope.form.type_and = true;
            appServices.buildMeta();
        }

    };


    $scope.selectTable = function(x){

        angular.element(menu).collapse('hide');

        if(x == 'events'){
            angular.element(document.getElementById('nav_events')).addClass('ng-hide');
            angular.element(document.getElementById('nav_images')).removeClass('ng-hide');
        }

        if(x == 'images'){
            angular.element(document.getElementById('nav_images')).addClass('ng-hide');
            angular.element(document.getElementById('nav_events')).removeClass('ng-hide');
        }

        $rootScope.active_table = x;

        $scope.form = {};
        $scope.query =  {};
        $scope.query.option = 'year';
        $scope.query.table = x;

        $http.post('/dropdowns/build', $scope.query)
            .then(function(response){
                $scope.years = response.data;
            });
    };

    $scope.build_query = function(x) {

        var query = {};


        if(this.form[x]){
            if (Object.keys($rootScope.baseline).length === 0) {
                $rootScope.baseline[x] = this.form[x];
                if(this.form.exclude){
                    $rootScope.baseline_type = 'exclude';
                }
            }
            else {
                if (this.form.type_and && this.form[x]) {
                    query.contract = {};
                    query.contract[x] = this.form[x];
                }
                if (this.form.type_or && this.form[x]) {
                    query.expand = {};
                    query.expand[x] = this.form[x];
                }
                if (this.form.exclude && this.form[x]) {
                    query.exclude = {};
                    query.exclude[x] = this.form[x];
                }

            }

            query.baseline = $rootScope.baseline;

            if ((!$rootScope.search_terms.contract[x] && this.form.type_and) || (!$rootScope.search_terms.expand[x] && this.form.type_or) || (!$rootScope.search_terms.exclude[x] && this.form.exclude)) {
                if (this.form.type_and && this.form[x]) {
                    $rootScope.search_terms.contract[x] = [];
                    $rootScope.search_terms.contract[x].push(this.form[x]);
                }
                if (this.form.type_or && this.form[x]) {
                    $rootScope.search_terms.expand[x] = [];
                    $rootScope.search_terms.expand[x].push(this.form[x]);
                }
                if (this.form.exclude && this.form[x]) {
                    $rootScope.search_terms.exclude[x] = [];
                    $rootScope.search_terms.exclude[x].push(this.form[x]);
                }

            }
            else {
                if (this.form.type_and && this.form[x]) {
                    $rootScope.search_terms.contract[x].push(this.form[x]);
                }
                if (this.form.type_or && this.form[x]) {
                    $rootScope.search_terms.expand[x].push(this.form[x]);
                }
                if (this.form.exclude && this.form[x]) {
                    $rootScope.search_terms.exclude[x].push(this.form[x]);
                }
            }

            appServices.buildMeta(query);

        }

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
        $scope.query.table = db;

        $http.post('/dropdowns/build', $scope.query)
            .then(function(response){

                if(response.data[0].name){
                    $scope.months = response.data;
                }
                if(response.data[0].day){
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


}]);
;app.controller('ResumeModalCtrl', function($scope, $modalInstance, $http, appServices, $location){

    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    };

});
;app.controller('SaveImgModalCtrl', ['imageServices', '$scope', '$rootScope', '$modalInstance', '$http', 'Upload', '$timeout', function(imageServices, $scope, $rootScope, $modalInstance, $http, Upload, $timeout){

    $scope.uploadFiles = function(file, opt){

        var progress = document.getElementById('progress');

        var done = 0;

        $scope.img = {};
        $scope.img.storage = $rootScope.default_storage;
        $scope.img.file = file.name;
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
                var width = file.progress + '%';

                angular.element(progress).css({"width": width});

                if(file.progress == 100){
                    done ++;
                    if(done === 3){
                        imageServices.addImg($scope.img);
                        $modalInstance.dismiss('cancel');
                        $rootScope.f = undefined;
                    }
                }
            });
        }
    };


}]);
;app.controller('singleViewModalCtrl', function($scope, $http, $modal, $rootScope, $location, Upload, appServices, imageServices){

    var menu = document.getElementsByClassName('collapse');

    $scope.animationsEnabled = true;

    $scope.open = function (size, option, misc) {

        var config = {
            $scope: $scope,
            $modal: $modal,
            modal: appServices.setModal(option),
            size: size
        };

        option  ? option = option.toLowerCase() : option = option;
        misc  ? misc =  misc.toLowerCase(): misc = misc;

        if(option === 'batch'){

            var arr = [];


            for(var prop in $scope.batchObj){
                if($scope.batchObj[prop]){
                    arr.push(prop);
                    $scope.batchObj[prop] = false;
                }
            }
            if(arr.length >= 1){
                    $scope.ids = arr;
                    openModal(config);
            }
        }

        else if(option === 'event'){
            angular.element(menu).collapse('hide');
            openModal(config);
        }

        else if(misc === 'new'){
            $scope.img = this.uncategorized;
            openModal(config);
        }

        else if(misc === 'allan'){
            $scope.projects = $rootScope.resumes.Allan;
            openModal(config);
        }

        else if(misc === 'fiona'){
            $scope.projects = $rootScope.resumes.Fiona;
            openModal(config);
        }

        else {
            openModal(config);
        }

    };

});

function openModal(obj) {

    if(obj.modal.contr === 'ModalInstanceCtrl' && !obj.$scope.event){
        console.log('carry on trucking');
    }
    else{
        var modalInstance = obj.$modal.open({
            scope: obj.$scope,
            animation: obj.$scope.animationsEnabled,
            templateUrl: obj.modal.templ,
            controller: obj.modal.contr,
            size: obj.size
        });
    }


};;app.service('accountServices', ['$http', function($http){

    var _accountServiceFactory = {};

    _accountServiceFactory.addAcct = function(obj){

        $http.post('/accounts_mgmt/add', obj)
            .then(function(response){
                _accountServiceFactory.viewAcct(obj.acct_type);
            });
    };

    _accountServiceFactory.deleteAcct = function(obj){

        $http.delete('/accounts_mgmt/' + obj.username)
            .then(function(response){
                _accountServiceFactory.viewAcct(obj.acct_type);
            });


    };

    _accountServiceFactory.viewAcct = function(acct, $scope){

        $http.get('/accounts_mgmt/'+ acct)
            .then(function(response){
                $scope.users = response.data;
            });

    };

    return _accountServiceFactory;

}]);;app.service('eventServices', ['$http', '$rootScope', function($http, $rootScope){

    var _eventServiceFactory = {};

    _eventServiceFactory.postEvent = function(obj){

        console.log('eventServices posting event: ', obj);

        $http.post('/events_mgmt/add', obj)
            .then(function(response){
                $rootScope.img = {};
            });

    };

    _eventServiceFactory.getEventById = function(id){

        $http.get('/events_mgmt/get_one/' + id)
            .then(function(response){
                if(response.data.length > 0){
                    $rootScope.event_form = response.data[0];
                    $rootScope.img.event = true;
                }
            });

    };

    _eventServiceFactory.updateEvent = function(obj){

        var addObj = {};

        for(var prop in obj){
            if(prop !== 'url'){
                addObj[prop] = obj[prop];
            }
        }

        $http.put('/events_mgmt', addObj)
            .then(function(response){
                $rootScope.event_form = {};
                $rootScope.img = {};
            });

    };

    _eventServiceFactory.getLatestEvent = function($scope){

        $http.get('/queries/latest')
            .then(function(response){
                $scope.event = response.data;
            });

    };

    _eventServiceFactory.getAllEvents = function($scope){

        $http.get('/events_mgmt')
            .then(function(response){
                $scope.events = response.data;
            });
    };

    return _eventServiceFactory;

}]);;app.factory('appServices', ['$http', '$rootScope',  function($http, $rootScope){

    var _appServicesFactory = {};

    var excl_incr;
    var conditions;

    var elements = {content: 'meta_div','point-in-time': 'time_div', list: 'list_div', add: 'add_div', images: 'image_div', events: 'event_div', storages: 'storage_div', projects: 'resume_div', tickers: 'ticker_div', biographies: 'biography_div'};

    var modals = {
        login: {contr: 'LoginModalCtrl', templ: './views/myLoginModal.html'},
        modify: {contr:'ModifyAcctModalCtrl', templ: './views/myChangePWModal.html'},
        resume: {contr: 'ResumeModalCtrl', templ: './views/myResumeModal.html'},
        file: {contr : 'SaveImgModalCtrl', templ: './views/mySaveImgModal.html'},
        meta: {contr: 'AddTagsModalCtrl', templ: './views/myAddTagsModal.html'},
        storage: {contr: 'ModifyAcctModalCtrl', templ: './views/myManageStoragesModal.html'},
        modify_storage: {contr: 'ModifyStorageModalCtrl', templ: './views/myModifyStorageModal.html'},
        add_storage: {contr: 'ModifyStorageModalCtrl', templ: './views/myAddStorageModal.html'},
        event: {contr: 'ModalInstanceCtrl', templ: './views/myLatestEventModal.html'},
        multi: {contr: 'ModalInstanceCtrl2', templ: './views/myMultiViewModal.html'},
        batch: {contr: 'BatchEditModalCtrl', templ: './views/myBatchEditModal.html'}
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

        if(!conditions){
            $http.get('/dropdowns/')
                .then(function(result){
                    $rootScope.meta = result.data;
                });
        }else {
            $http.get('/dropdowns/'+ conditions)
                .then(function(result){
                    $rootScope.meta = result.data;
                });
        }

        $http.put('/queries/count', {conditions: conditions})
            .then(function(response){
                $rootScope.queries_count = response.data[0].count;
            });

    };

    _appServicesFactory.selectTab = function(option){

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

    //_appServicesFactory.update_files = function($scope){
    //
    //    $http.get('/image_jobs/count/' + $rootScope.default_storage)
    //        .then(function(result){
    //            $rootScope.img_db = result.data;
    //
    //            $http.get('/image_jobs/new_files/')
    //                .then(function(result){
    //                    if(parseInt(result.data.amount)  > parseInt($rootScope.img_db.size)){
    //                        console.log('new files in directory', result.data.amount);
    //                    }
    //                    else{
    //                        console.log('no new files in directory', result.data.amount);
    //                    }
    //                });
    //        });
    //
    //};

    return _appServicesFactory;

}]);

;app.factory('getGlobals', ['$global', function($global){

    var _send = $global.request;

    return {
        tickers: function(){
            return _send($global.url('tickers'));
        },
        biographies: function(){
            return _send($global.url('biographies'));
        },
        resumes: function(){
            return _send($global.url('resumes'));
        }
    }

}]);;
app.service('imageServices', ['$http','$rootScope', 'appServices', 'capInitialFilter', 'eventServices', function($http, $rootScope, appServices, capInitialFilter, eventServices){

    var _imageServiceFactory = {};

    _imageServiceFactory.getAll = function($scope){

        $http.get('/images_mgmt/get_all')
            .then(function(response){
                $scope.images = response.data;
            });
    };

    _imageServiceFactory.getLatest = function(){

        $http.get('/images_mgmt/get_latest')
            .then(function(response){
               $rootScope.img = response.data;

            });

    };

    _imageServiceFactory.addImg = function(image, batch, $scope){

        $http.get('/exif/' + image.file)

            .then(function(response){

                var coord = response.data.coordinates;

                if(!image.created){
                    image.created = response.data.created;
                }

                $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + response.data.coordinates + '&key=' + response.data.API_KEY)
                    .then(function(response){

                        if(response.data.status === 'OK'){

                            image = _imageServiceFactory.buildImageObject(image, response.data.results[0].address_components);

                        }

                        if(coord && response.data.status === 'ZERO_RESULTS'){

                            $rootScope.images[index].country = 'En Route';
                            $rootScope.images[index].state = 'N/a';
                            $rootScope.images[index].city = 'En Route';

                        }


                        $http.post('/images_mgmt/add', image)

                            .then(function(response){
                                response.data.name == 'error' ? $scope.newImages[image.file] = response.data.detail : $scope.newImages[image.file] = false;
                            })
                            .then(function(response){
                                _imageServiceFactory.getUncategorisedImg();
                            })
                            .then(function(response){
                                if(batch){
                                    $scope.loadNewImages();
                                }else{
                                    _imageServiceFactory.getAll()
                                }
                            });

                    });

            });

        function findAddressComponent (components, target) {

            var element;

            for (var i = 0; i < components.length; i++ ){

                components[i].types.forEach(function(elem,ind){
                    if(elem === target){
                        element = components[i];
                    }
                })

            }

            return element;

        }

    };

    _imageServiceFactory.addTags = function(obj){

        console.log('hvad kommer ind her: ', obj, this);

        var addTags = {};
        var addEvent = {};

        if(obj.country && obj.country.toLowerCase() === 'usa'){
            obj.country = 'united states of america';
        }

        if(obj.add_event){
            for(var prop in obj){
                if(prop === 'id'){
                    addEvent.img_id = obj[prop];
                }
                else if(prop === 'event_da' || prop === 'event_en'){
                    addEvent[prop] = obj[prop];
                }

            }

            $http.post('/events_mgmt/add', addEvent)
                .then(function(response){
                    eventServices.getAllEvents();
                    _imageServiceFactory.getAll();
                });
        }

        if(obj.add_tags) {

            for (var prop in obj) {
                if ((prop === 'meta' || prop === 'names' || prop === 'country' || prop === 'state' || prop === 'city' || prop === 'occasion' || prop === 'id') && obj[prop] !== null ) {
                    if(prop !== 'id'){
                        addTags[prop] = capInitialFilter(obj[prop]);
                    }else{
                        addTags[prop] = obj[prop];
                    }
                }
            }

            $http.put('/images_mgmt/add_meta', addTags)
                .then(function (response) {
                    _imageServiceFactory.getUncategorisedImg();
                    _imageServiceFactory.getAll();
                });

        }
    };

    _imageServiceFactory.getUncategorisedImg = function($scope){

        console.log('show me scope: ', $scope);

        $http.get('/images_mgmt/get_new')
            .then(function(response){
                $rootScope.uncategorized = response.data;

            });
    };

    _imageServiceFactory.getImgById = function(id){

        $http.get('/images_mgmt/get_one/' + id)
            .then(function(response){
                $rootScope.img = response.data;

                if(!$rootScope.img.event){
                    eventServices.getEventById(id);
                }

            });

    };

    _imageServiceFactory.batchEdit = function(obj){

        var batch = {};

        if(obj.country && obj.country.toLowerCase() === 'usa'){
            batch.country = 'united states of america';
        }

        for (var prop in obj) {
            if(obj[prop] && prop){
                batch[prop] = capInitialFilter(obj[prop]);
            }
        }

        $http.post('/images_mgmt/batch', batch)
            .then(function(response){
                _imageServiceFactory.getUncategorisedImg();
                _imageServiceFactory.getAll();
            });

    };

    _imageServiceFactory.getNewImages = function($scope){

        $scope.newImages = {};

        $http.get('/image_jobs/files')
            .then(function(response){
                if(response.data){
                    $scope.newImages = response.data;
                }
            });

    };

    _imageServiceFactory.getNewImagesCount = function($scope){

        $http.get('/image_jobs/new_files/')
            .then(function(result){
                console.log('hello: ',result.data);
                $scope.newFilesCount = result.data.amount;
            });
    };

    _imageServiceFactory.getExifData = function (file) {

        $http.get('/exif/' + file)
            .then(function(response){
                $rootScope.exifData = response.data;
                return true;
            });
    };

    _imageServiceFactory.buildImageObject = function(image, locationDataArray){

        var parsedImage = image;

        function parse (array, target) {
            var locationDataObject,i;

            for(i = 0; i < array.length; i++){
                array[i].types.forEach(function(elem,ind){
                    if(elem === target){
                        locationDataObject = array[i];
                    }
                })
            }
            return locationDataObject;
        }

        parse(locationDataArray, 'country') ? parsedImage.country = parse(locationDataArray, 'country').long_name : parsedImage.country = 'En Route';
        parse(locationDataArray, 'administrative_area_level_1') ? parsedImage.state = parse(locationDataArray, 'country').short_name + ' - ' + parse(locationDataArray, 'administrative_area_level_1').long_name: parsedImage.state = 'N/a';
        parse(locationDataArray,'point_of_interest') ? parsedImage.meta.push(parse(locationDataArray,'point_of_interest').long_name) : parsedImage.meta = parsedImage.meta;

        if(parse(locationDataArray, 'locality')){
            if(parse(locationDataArray, 'route') && parse(locationDataArray, 'route').short_name === 'Ellsworth Dr'){
                parsedImage.city = 'Edina';
            }else{
                parsedImage.city = parse(locationDataArray, 'locality').long_name;
            }
        }else {
            parsedImage.city = 'En Route';
        }

        return parsedImage;
    };

    _imageServiceFactory.deleteImages = function(imageArray){

        $http.delete('/images_mgmt/' + imageArray)
            .then(function(response){
                _imageServiceFactory.getUncategorisedImg();
                _imageServiceFactory.getAll();
                appServices.update_files();
            })

    };

    _imageServiceFactory.getDbCount = function($scope) {

        $http.get('/image_jobs/count/' + $rootScope.default_storage)
            .then(function(response){
                $scope.dbCount = response.data;
            })

    };

    return _imageServiceFactory;

}]);;app.service('landingPageServices', ['$http', 'loadServices', function($http, loadServices){

    this.postTicker = function(form){

        $http.post('/landing_mgmt/tickers', form)
            .then(function(response){
                loadServices.getTickers();
            });

    };

    this.postProject = function(form){

        $http.post('/landing_mgmt/projects', form)
            .then(function(response){
                loadServices.getProjects();
            });

    };

    this.postBio = function(form){

        $http.put('/landing_mgmt/bios', form)
            .then(function(response){
                loadServices.getBios();
            });

    };

    this.getBio = function(owner){

        loadServices.getBios();

    };
}]);;app.service('loadServices', ['$http', '$rootScope', function($http, $rootScope){

    this.getBios = function(){
        $http.get('landing_mgmt/bios/all')
            .then(function(response){
                $rootScope.subjects = response.data;
            });
    };

    this.getTickers = function(){
        $http.get('/landing_mgmt/tickers')
            .then(function(response){
                $rootScope.tickers = response.data;
            });
    };

    this.getProjects = function(){
        $http.get('/landing_mgmt/projects')
            .then(function(response){
                $rootScope.resumes = response.data;
            });
    }

}]);;app.factory('$global',['$http', function($http){

    var _urls = {
        biographies: '/landing_mgmt/bios/all',
        tickers: '/landing_mgmt/tickers',
        resumes: '/landing_mgmt/projects'
    };

    var _biographies = {};
    var _tickers = {};
    var _resumes = {};

    var _globalFactory = {};


    _globalFactory.request = function(str){
        return $http.get(str);
    };

    _globalFactory.url = function(which){
        return _urls[which];
    };

    _globalFactory.setBiographies = function(data){
        _biographies = data;
    };

    _globalFactory.getBiographies = function(){
        return _biographies;
    };

    _globalFactory.setTickers = function(data){
        _tickers = data;
    };

    _globalFactory.getTickers = function(){
        return _tickers;
    };

    _globalFactory.setResumes = function(data){
        _resumes = data;
    };

    _globalFactory.getResumes = function(){
        return _resumes;
    };

    return _globalFactory;

}]);;app.service('storageServices', ['$http','$rootScope', function($http, $rootScope){

    var _storageServiceFactory = {};


    _storageServiceFactory.addStorage = function(form){

        $http.post('/storages_mgmt/add', form)
            .then(function(response){
                _storageServiceFactory.getStorages();
            });

    };


    _storageServiceFactory.deleteStorage = function(storage){

        $http.delete('/storages_mgmt/'+ storage)
            .then(function(response){
                _storageServiceFactory.getStorages();
            });

    };

    _storageServiceFactory.getStorages = function(){

        console.log('loading storages');

        $http.get('/storages_mgmt/all')
            .then(function(response){
                $rootScope.storages = response.data;
            });
    };

    _storageServiceFactory.modifyStorage = function(obj){

        $http.put('/storages_mgmt/update', obj)
            .then(function(response){
                _storageServiceFactory.getStorages();
            });

    };

    return _storageServiceFactory;

}]);;app.directive('insertBio', function(){

    return {
        restrict: 'EA',
        scope: {
            subject: '='
        },
        templateUrl: 'views/biography.html'
    };

});;app.directive('myAddStorageModal', function(){

    return {
        restrict: 'EA'
    }
});;app.directive('myAddTagsModal', function(){

    return {
        restrict: 'EA'
    }
});;app.directive('myBatchEditModal', function(){

    return {
        restrict: 'EA'
    }
});;app.directive('myChangePwModal', function(){

    return {
        restrict: 'EA'
    }
});;app.directive('myLatestEventModal', function(){

    return {
        restrict: 'EA',
        templateUrl: 'views/latestEvent.html'
    };
});;app.directive('myLoginModal', function(){

    return {
        restrict: 'EA'
    };
});
;app.directive('myManageStoragesModal', function(){

    return {
        restrict: 'EA'
    }
});;app.directive('myModifyStorageModal', function(){

    return {
        restrict: 'EA'
    }
});;app.directive('myMultiViewModal', function(){

    return {
        restrict: 'EA',
        templateUrl: 'views/multiView.html'
    };
});;app.directive('myResumeModal', function(){

    return {
        restrict: 'EA'
    };
});
;app.directive('mySaveImgModal', function(){

    return {
        restrict: 'EA'
    }
});