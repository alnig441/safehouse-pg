var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ngAnimate', 'ngFileUpload', 'simpleAngularTicker', 'ngSanitize']);

app.config(function($routeProvider, $locationProvider){

    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/login', {
            templateUrl: 'views/newLogin.html',
            controller: 'indexCtrl'
        })
        .when('/admin', {
            templateUrl: 'views/admin.html',
            controller: 'adminCtrl'
        })
        .when('/private', {
            templateUrl: 'views/private.html',
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

app.run(['$rootScope', 'loadServices', '$http', function($rootScope, loadServices, $http){

    $rootScope.tickers = {Allan: [{headline: '', copy: '', created_str: ''}], Fiona: [{headline: '', copy: '', created_str: ''}]};

    //loadServices.getBios();
    //loadServices.getTickers();
    //loadServices.getProjects();
    loadServices.getCopy();

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
            if(input.charAt(3) != '-'){
                input = input.toLowerCase();
            }
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


app.filter('replaceSingleQuote', function(){

    return function(input){

        var str = input.replace(/\'/g, "''" );

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

};app.controller('acctsCtrl',['accountServices', '$scope', 'appServices', '$http', '$rootScope', function(accountServices, $scope, appServices, $http, $rootScope){

    $scope.getValues = function(){

    };


    $scope.addAcct = function(){

        accountServices.addAcct(this.form, $scope);

        appServices.selectTab('list');

    };

    $scope.viewAcct = function(){

        accountServices.viewAcct(this.form.acct_type, $scope);

    };

    $scope.delAcct = function(){

        accountServices.deleteAcct(this.user, $scope);
    };

}]);
;app.controller('AddTagsModalCtrl', ['imageServices', 'capInitialFilter', '$scope', '$modalInstance', '$http', '$rootScope', 'appServices', function(imageServices, capInitialFilter, $scope, $modalInstance, $http, $rootScope, appServices){

    $scope.submit = function(){

        console.log('hvad kommer ind; ', this.tags_form, this.uncategorized, this.img, this.transientImage, $rootScope.transientImage);

        $scope.activeTool = '';

        this.img.id ? this.tags_form.id = this.img.id : this.tags_form.id = this.uncategorized.id;

        imageServices.addTags($scope, this.tags_form);

        $modalInstance.dismiss('cancel');

    };

    $scope.cancel = function(){
        $rootScope.img = {};
        $rootScope.tags_form = {};
        $modalInstance.dismiss('cancel');
    };
}]);
;app.controller('adminCtrl', ['$scope', '$rootScope', '$location', 'appServices',  function($scope, $rootScope, $location, appServices){

    console.log('acctsctrl - hello');

    //var menu = document.getElementsByClassName('collapse');

    $scope.batchEdit = {};
    $rootScope.view = "images";
    $rootScope.template.url = './views/images.html';

    $scope.select = function(choice){

        appServices.selectTab(choice.toLowerCase());

    };

}]);
;app.controller('BatchEditModalCtrl', ['imageServices', 'capInitialFilter', '$scope', '$modalInstance', '$http', '$rootScope', 'appServices', function(imageServices, capInitialFilter, $scope, $modalInstance, $http, $rootScope, appServices){

    console.log('copy: ', $rootScope.copy);

    $scope.submit = function(){

        if(this.batchEdit){
            this.batchEdit.id = $scope.ids;
            imageServices.batchEdit(this.batchEdit, $scope);
        }

        $modalInstance.dismiss('cancel');

    };

    $scope.delete = function(){

        console.log('deleting ', this);

        imageServices.deleteImages($scope.ids, $scope);

        $modalInstance.dismiss('cancel');
    }

    $scope.cancel = function(){
        $rootScope.img = {};
        $modalInstance.dismiss('cancel');
    };
}]);
;app.controller('globalNavCtrl', ['$scope', '$rootScope', 'appServices',  function($scope, $rootScope, appServices){

    $scope.goTo = function(view) {

        var elem = document.getElementsByClassName('collapse');

        $rootScope.view = view;
        $rootScope.template.url = $rootScope.copy.partials[view].url;

        angular.element(elem).collapse("toggle");

    }

}]);;app.controller('imageCtrl', ['storageServices', 'eventServices', 'imageServices', '$scope', '$rootScope', '$http', 'Upload', '$timeout', '$location', '$interval','appServices', function(storageServices, eventServices, imageServices, $scope, $rootScope, $http, Upload, $timeout, $location, $interval, appServices){

    //INITIALISE $scope VARIABLES
    initialiseScope();

    function initialiseScope() {
        imageServices.getNewImages($scope);
        imageServices.getAll($scope);
        eventServices.getAllEvents($scope);
        $scope.batchObj = {};
        $scope.batch = {};
    }

    //FUNCTION TO REINITIALISE SCOPE VARIABLES UPON CONCLUSION OF VARIOUS image/event SERVICE CALLS
    $scope.runReInit = function(){
        initialiseScope();
    };

    //COLLAPSE DOM DROPDOWN MENU
    var menu = document.getElementsByClassName('collapse');

    $scope.toolSelector = function(){

        $scope.activeTool = this.activeTool;

    };

    $scope.runTool = function(){

        $scope[$scope.activeTool]();

    };


    //TOOL TO UPDATE FILE INFORMATION BASED ON EXIF DATA EXTRACTED FROM THE IMAGE FILE

    $scope.checkExif = function () {

        function getIndex () {
            var i = 0;
            var element;


            while(i < $scope.images.length){
                //OLD VERSION; ONLY RUN UPDATE IF LAST ENTRY IS NOT 'checked' OR 'updated'
                //if($scope.images[i].meta[$scope.images[i].meta.length -1].toLowerCase() != 'checked' && $scope.images[i].meta[$scope.images[i].meta.length -1].toLowerCase() != 'updated'){

                //NEW VERSION: ONLY RUN UPDATE IF LAST ENTRY IS 'Update'
                if($scope.images[i].meta[$scope.images[i].meta.length -1].toLowerCase() === 'update'){

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

        //OUTPUT A LIST OF FILES THAT FOR SOME WEREN'T UPDATED
        if(!index){
            var images = [];
            $scope.images.forEach(function(elem,ind){
                if(elem.meta[elem.meta.length -1] === 'checked'){
                    images.push(elem);
                }

            })
        }

        if (index) {

            $rootScope.transientImage = $scope.images[index];
            $rootScope.transientImage.meta.push('checked');

            imageServices.getExifData($scope);

        }
    };

    $scope.loadNewImages = function() {

        function get_next_img() {
            for(var prop in $scope.newImages){
                if($scope.newImages[prop] === true){
                    return prop;
                }
            }
        }

        $rootScope.transientImage.file = get_next_img();
        $rootScope.transientImage.storage = $rootScope.default_storage;

        if($rootScope.transientImage.file) {
            imageServices.getExifData($scope);
        }
    };

    $scope.deleteImg = function(){

        var id;
        this.uncategorized.id ? id = this.uncategorized.id : id = this.img.id;
        imageServices.deleteImages(id, $scope);

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

    //HAS BEEN ADDED TO storagesCtrl

    $scope.deleteStorage = function(){

        storageServices.deleteStorage(this.storage.folder);
    };

    $scope.getEventById = function(){

        var id = this.tags_form.event.img_id;
        $rootScope.img = {};
        eventServices.getEventById(id);
        imageServices.getImgById(id);

    };

    $scope.updateEvent = function(){

        eventServices.updateEvent($rootScope.tags_form.event);

    };

    $scope.getImgById = function(){

        $rootScope.tags_form = {};
        imageServices.getImgById(this.img.id);

    };

}]);
;app.controller('indexCtrl',['$timeout', '$location', '$http', '$rootScope', '$scope','$global','getGlobals', 'appServices', 'loadServices', function($timeout, $location, $http, $rootScope, $scope, $global, getGlobals, appServices, loadServices){

    $scope.form = {};

    $scope.sendForm = function(){

        console.log('Form: ', this.form);
        console.log('Form valid: ', this.contactForm.$valid, '\nName valid: ', this.contactForm.name.$valid, '\nEmail valid: ', this.contactForm.email.$valid, '\nProject valid: ', this.contactForm.project.$valid, '\nCompany valid: ', this.contactForm.company.$valid, '\nBudget valid: ', this.contactForm.budget.$valid);

        var statusElement = angular.element(document).find('p#status');

        if(this.contactForm.$valid && this.form.name && this.form.email && this.form.project){

            console.log('valid: ', $scope.form.input);

            $http.post('/form_mailer', this.form)
                .then(function(response){
                    if(response.data.accepted){
                        statusElement.addClass('bg-success');
                        $scope.status = 'message received - thank you!';
                        $scope.form = {};
                    }
                    else if(response.data.rejected){
                        statusElement.addClass('bg-danger');
                        $scope.status = 'something went wrong - try again';
                    }
                    this.form = {};
                    $timeout(clearMessage, 5000);
                })
        }
        else {
            statusElement.addClass('bg-warning');
            $scope.status = 'please fill in required fields';
            $timeout(clearMessage, 5000);

        }

    }

    function clearMessage () {
        angular.element(document).find('p#status').removeClass('bg-success bg-warning bg-danger');
        $scope.status = undefined;
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

}]);
;app.controller('localNavCtrl', ['$scope', 'appServices', function($scope, appServices){

    $scope.goTo = function(tab){

        appServices.selectTab(tab.toLowerCase());

        if(tab === 'meta'){

            $scope.form = {};
            $scope.form.contract = true;

            appServices.buildMeta();

        }
        else{
            $scope.form = {};
        //    appServices.initPiTSearch($scope, "images");
        }

    }
}]);;app.controller('LoginModalCtrl', function ($scope, $modalInstance, $http, $location, $rootScope, appServices, storageServices, imageServices, eventServices, $route) {

    $scope.submit = function(){

        $rootScope.template = {};

        $http.post('/login/authenticate', $scope.form)
            .then(function(response){

                // RELOAD ROUTES IN ORDER TO REINSTANTIATE CONTROLLERS AFTER PREVENTDEFAULT RUN IN SCROLLTO.JS
                $route.reload();

                var acct  = response.data.acct_type;
                var lang  = response.data.lang;

                if(acct === 'admin'){

                    appServices.getCopy();

                    //INITIALISE rootScope VARIABLES
                    $rootScope.img = {};
                    $rootScope.tags_form = {};
                    $rootScope.transientImage = {};

                    //LOAD rootScope VARIABLES
                    storageServices.getStorages();
                    imageServices.getUncategorisedImg();

                    $rootScope.default_storage = response.data.storages[0];

                    $location.path('/admin');

                }
                else if(acct === 'private'){

                    appServices.getCopy(lang);

                    $rootScope.storages = response.data.storages;
                    $rootScope.default_storage = $rootScope.storages[0];
                    $rootScope.tab = 'time';
                    $rootScope.view = 'images';
                    $rootScope.template.url = './views/imageSearch.html';
                    $rootScope.events = {};

                    $location.path('/private');

                }
                else{$location.path('/login');}
            });

        $modalInstance.dismiss('cancel');
    };

    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    };

});
;app.controller('logoutCtrl', function($scope, $location, $http, loadServices, $route){

    $scope.logout = function(){

        loadServices.getCopy();

        $http.get('/logout')
            .then(function(response){
                $route.reload();
                $location.path('/login');
            });
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
;app.controller('myPictureFrameCtrl', ['$scope','$rootScope', 'appServices', '$http', '$timeout', 'eventServices', function($scope, $rootScope, appServices, $http, $timeout, eventServices){

    $scope.selector = 0;

    $scope.close = function() {

        $scope.selector = 0;
        $rootScope.spinning = false;

        angular.element(document.getElementById("myFrame")).css({"top": "-1200px", "transition-duration": "0.5s" });
        angular.element(document.getElementById("privateTmpl")).css({'position': 'static', 'opacity':'1'});

        $timeout(function(){
            angular.element(document.getElementsByTagName('img')).removeClass('playing paused').removeAttr('src');
            angular.element(document.getElementById('header_text')).text('');
            angular.element(document.getElementsByClassName('fa-pause')).removeClass('fa-pause').addClass('fa-play');
            angular.element(document.getElementById('stepForward')).prop('disabled', false);
            angular.element(document.getElementById('stepBackward')).prop('disabled', false);
            $timeout.cancel();
        },1000);


    }

    $scope.callToAction = function(action, origin) {

        console.log('call to action: ', $scope);

        var body = document.getElementsByClassName('body');
        var footer = document.getElementsByClassName('footer');

        switch (action) {

            case 'play':

                if(angular.element(footer).find('#play').children('i').hasClass('fa-play')){
                    angular.element(footer).find("#play").children('i').addClass('fa-pause').removeClass('fa-play');
                    angular.element(body).find('img').removeClass('paused').addClass('playing');
                    angular.element(footer).find('#stepForward').prop('disabled', true);
                    angular.element(footer).find('#stepBackward').prop('disabled', true);
                    $scope.callToAction('stepForward', 'playFunction');
                    break;
                }

                if(angular.element(footer).find('#play').children('i').hasClass('fa-pause')){
                    angular.element(footer).find('#play').children('i').addClass('fa-play').removeClass('fa-pause');
                    angular.element(body).find('img').removeClass('playing loading').addClass('paused');
                    angular.element(footer).find('#stepForward').prop('disabled', false);
                    angular.element(footer).find('#stepBackward').prop('disabled', false);
                    if($scope.selector === 0) {
                        $scope.selector = $rootScope.events.length - 1;
                    }
                    else {
                        $scope.selector --;
                    }
                    break;
                }

            case 'stepForward':

                if($rootScope.events.length -1 === $scope.selector){
                    $scope.selector = 0;
                }
                else {
                    $scope.selector ++;
                }
                angular.element(body).find('.next').removeClass('loaded').addClass('loading').prop('src', $rootScope.events[$scope.selector].url);
                break;

            case 'stepBackward':

                if($scope.selector === 0){
                    $scope.selector = $rootScope.events.length -1;
                }
                else{
                    $scope.selector--;
                }
                angular.element(body).find('.next').removeClass('loaded').addClass('loading').prop('src', $rootScope.events[$scope.selector].url);

                break;

            default:
                $scope.close();
                break;
        }

    }

    $scope.executeSearch = function (type) {

        $rootScope.spinning = true;
        $rootScope.startMoment = Date.now();

        if(type === 'latest') {

            $http.get('/queries/latest')
                .then(function(response){
                    $rootScope.events = response.data;
                })
                .then(function(response){
                    var current = document.getElementsByClassName('current');
                    var footer = document.getElementsByClassName('footer');
                    var header = document.getElementsByClassName('header');
                    angular.element(current).prop('src', $rootScope.events.url);
                    angular.element(footer).find('#footer_date').text($rootScope.events.created);
                    angular.element(header).find('#header_text').text($rootScope.events.description);
                })

        }

        else {

            var obj = {};
            var arr = [];

            if(appServices.getConditions()){
                arr = appServices.getConditions().trim().split(' ');
            }

            if(type === 'meta' && arr[0]){
                if(arr[0].toLowerCase() !== 'select'){
                    obj.query = "select id, created, year, month, day, path || folder || '/' || file as url from (select * from images where meta is not null "+ appServices.getConditions() +") as x cross join storages where folder = x.storage order by created asc";
                }
                else{
                    obj.query = "select id, created, year, month, day, path || folder || '/' || file as url from ("+ appServices.getConditions()+ ") as x cross join storages where folder = x.storage order by created asc";
                    obj.query = obj.query.replace(/COLUMN/g, "*");
                }
            }
            else{
                Object.keys($scope.searchArea).forEach(function(elem, ind, array){
                    if($scope.searchArea[elem]){
                        $scope.form.table = elem;
                    }
                });
                obj = $scope.form;
            }

            var temp = [];


            $http.post('/queries', obj)
                .then(function(response){
                    $rootScope.events = response.data;

                })
                .then(function(response){
                    var current = document.getElementsByClassName('current');
                    var footer = document.getElementsByClassName('footer');
                    var header = document.getElementsByClassName('header');
                    angular.element(current).prop('src', $rootScope.events[0].url);
                    angular.element(footer).find('#footer_id').text('ID: ' + $rootScope.events[0].id);
                    angular.element(footer).find('#footer_date').text($rootScope.events[0].created);
                    angular.element(footer).find('#footer_count').text($scope.selector + 1 + '/' + $rootScope.events.length);

                    if($rootScope.events[0].description){
                        angular.element(header).find('#header_text').text($rootScope.events[0].description);
                    }
                    $rootScope.spinning = false;
                })
        }



    };




}]);;app.controller('privCtrl', ['mapTabsFilter','$scope','$rootScope', '$http', '$log', '$modal', '$location','appServices', 'imageServices', 'eventServices', '$timeout', 'replaceSingleQuoteFilter', function(mapTabsFilter, $scope, $rootScope, $http, $log, $modal, $location, appServices, imageServices, eventServices, $timeout, replaceSingleQuoteFilter){

    console.log('privCtrl root: ', $rootScope);

    $scope.summaryCount = {};

    imageServices.getDbCount($scope);
    eventServices.getEventCount($scope);
    imageServices.getVideos($scope);
    appServices.resetSQ();
    appServices.initPiTSearch($scope, 'images');

    //$rootScope.template = {};
    //INITIALISE NG-INCLUDE
    //$rootScope.view = 'images';

    //$rootScope.template.url = './views/imageSearch.html';

    //USE selected_db TO INDICATE WHICH STORAGE AREA IS BEING ACCESSED
    $scope.selected_db = $rootScope.default_storage;
    $scope.form.contract = true;

    //FORM SEARCH TYPE SELECTOR FUNCTION
    $scope.flipType = function(operator){

        switch (typeof operator) {
            case "number":

                switch (operator) {
                    case 0:
                        $scope.form.expand = false;
                        $scope.form.exclude = false;
                        break;
                    case 1:
                        $scope.form.contract = false;
                        $scope.form.exclude = false;
                        break;
                    case 2:
                        $scope.form.contract = false;
                        $scope.form.expand = false;
                        break;
                }

                break;

            case "string":

                switch (operator){
                    case "images":
                        $scope.searchArea.events = false;
                        break;
                    case "events":
                        $scope.searchArea.images = false;
                        break;
                }

                break;
        }

    };

    //FUNCTION TO ORGANISE, PRIORITISE AND RELAY SELECTED META SEARCH TERMS TO appServices QUERY BUILDER.
    //IN RESPONSE appServices.buildMeta() WILL
    //1) POPULATE THE META SEARCH FIELDS WITH APPROPRIATE VALUES
    //2) CREATE THE APPROPRIATE POSTGRES SEARCH STRING FOR WHEN IMAGE SEARCH IS SUBMITTED
    $scope.build_query = function(searchTerm) {

        var query = {};
        var input = replaceSingleQuoteFilter(this.form[searchTerm]);

        if(this.form[searchTerm]){
            if (Object.keys($rootScope.baseline).length === 0) {
                $rootScope.baseline[searchTerm] = input;
                if(this.form.exclude){
                    $rootScope.baseline_type = 'exclude';
                }
            }
            else {
                if (this.form.contract && this.form[searchTerm]) {
                    query.contract = {};
                    query.contract[searchTerm] = input;
                }
                if (this.form.expand && this.form[searchTerm]) {
                    query.expand = {};
                    query.expand[searchTerm] = input;
                }
                if (this.form.exclude && this.form[searchTerm]) {
                    query.exclude = {};
                    query.exclude[searchTerm] = input;
                }

            }

            query.baseline = $rootScope.baseline;

            if ((!$rootScope.search_terms.contract[searchTerm] && this.form.contract) || (!$rootScope.search_terms.expand[searchTerm] && this.form.expand) || (!$rootScope.search_terms.exclude[searchTerm] && this.form.exclude)) {
                if (this.form.contract && this.form[searchTerm]) {
                    $rootScope.search_terms.contract[searchTerm] = [];
                    $rootScope.search_terms.contract[searchTerm].push(this.form[searchTerm]);
                }
                if (this.form.expand && this.form[searchTerm]) {
                    $rootScope.search_terms.expand[searchTerm] = [];
                    $rootScope.search_terms.expand[searchTerm].push(this.form[searchTerm]);
                }
                if (this.form.exclude && this.form[searchTerm]) {
                    $rootScope.search_terms.exclude[searchTerm] = [];
                    $rootScope.search_terms.exclude[searchTerm].push(this.form[searchTerm]);
                }

            }
            else {
                if (this.form.contract && this.form[searchTerm]) {
                    $rootScope.search_terms.contract[searchTerm].push(this.form[searchTerm]);
                }
                if (this.form.expand && this.form[searchTerm]) {
                    $rootScope.search_terms.expand[searchTerm].push(this.form[searchTerm]);
                }
                if (this.form.exclude && this.form[searchTerm]) {
                    $rootScope.search_terms.exclude[searchTerm].push(this.form[searchTerm]);
                }
            }

            appServices.buildMeta(query);

        }

    };

    //FUNCTON TO BUILD DROPDOWN-AND-SELECT BOXES FOR TIME BASED SEARCH
    $scope.getValues = function(key){

        var table = '';

        if(this.form.year){

            switch (key) {
                case "year":
                    this.form.option = "month";
                    break;
                case "month":
                    this.form.option = "day";
                    break;
                case "day":
                    this.form.option = "year";
                    break;
            }

            Object.keys($scope.searchArea).forEach(function(elem,ind,array){
                if($scope.searchArea[elem]){
                    table = elem;
                }
            });

            this.form.table = table;

            appServices.buildDropdowns($scope);

        }

    };

    //FUNCTION TO CLEAR SELECTED META SEARCH TERMS FROM $scope.build_query
    $scope.clear = function(){

        $scope.form = {};
        $scope.form.contract = true;
        $scope.form.expand = false;
        $scope.form.exclude = false;

        if($rootScope.tab === 'time'){
            appServices.initPiTSearch($scope, 'images');
        }

        else{
            appServices.resetSQ();
            appServices.buildMeta();
        }

    };

    $scope.expand = function(key){

        $scope.videos.active = this.item.year;

    };

    $scope.collapse = function(key){

        $scope.videos.active = false;

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

        $rootScope.transientImage.storage = $rootScope.default_storage;
        $rootScope.transientImage.file = file.name;
        if($scope.created){
            $rootScope.transientImage.created = $scope.created;
        }

        $scope.activeTool = '';

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
                        imageServices.getExifData($scope);
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

    $scope.setSrc = function(src) {

        console.log('show src: ', src);

        document.getElementById('myVideo').src = src;


    }

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

        else if(misc === 'new'){

            if(this.uncategorized){
                $rootScope.tags_form.image = {};
                $rootScope.tags_form.image.country = this.uncategorized.country;
                $rootScope.tags_form.image.state = this.uncategorized.state;
                $rootScope.tags_form.image.city = this.uncategorized.city;
                $rootScope.tags_form.image.id = this.uncategorized.id;

            }

            //CAPTURE IMAGE URL FOR DISPLAY IN MODAL
            $scope.img.url = this.uncategorized.url;

            openModal(config);
        }

        else {
            openModal(config);
        }

    };

});

function openModal(obj) {

    if(obj.modal.contr === 'LatestEventModalCtrl' && !obj.$scope.event){
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


};;app.controller('VideoModalCtrl', function($scope, $modalInstance){

    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    }
});;app.service('accountServices', ['$http', function($http){

    var _accountServiceFactory = {};

    _accountServiceFactory.addAcct = function(obj, $scope){

        $http.post('/accounts_mgmt/add', obj)
            .then(function(response){
                _accountServiceFactory.viewAcct(obj.acct_type, $scope);
            });
    };

    _accountServiceFactory.deleteAcct = function(obj, $scope){

        $http.delete('/accounts_mgmt/' + obj.username)
            .then(function(response){
                _accountServiceFactory.viewAcct(obj.acct_type, $scope);
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

    _eventServiceFactory.postEvent = function($scope, obj){

        $http.post('/events_mgmt/add', obj)
            .then(function(response){
                $rootScope.tags_form = {};
                $rootScope.img = {};

            })
            .then(function(){
                $scope.runReInit();
            });

    };

    _eventServiceFactory.getEventById = function(id){

        $http.get('/events_mgmt/get_one/' + id)
            .then(function(response){
                if(response.data.length > 0){
                    $rootScope.tags_form.event = response.data[0];
                    $rootScope.img.id = id;
                    //$rootScope.img.event = true;
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
                $rootScope.tags_form.event = {};
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

    _eventServiceFactory.getEventCount = function($scope){

        $http.get('/events_mgmt/get_count/' + $rootScope.default_storage)
            .then(function(response){
                $scope.summaryCount.events = response.data;
            })
    }

    return _eventServiceFactory;

}]);;app.factory('appServices', ['$http', '$rootScope',  function($http, $rootScope){

    var _appServicesFactory = {};

    var excl_incr;
    var conditions;

    var elements = {
        meta: 'meta_div',
        time: 'time_div',
        list: 'list_div',
        add: 'add_div',
        images: 'image_div',
        events: 'event_div',
        storages: 'storage_div',
        projects: 'resume_div',
        tickers: 'ticker_div',
        biographies: 'biography_div'
    };

    var modals = {
        login: {contr: 'LoginModalCtrl', templ: './views/myLoginModal.html'},
        modify: {contr:'ModifyAcctModalCtrl', templ: './views/myChangePWModal.html'},
        resume: {contr: 'ResumeModalCtrl', templ: './views/myResumeModal.html'},
        file: {contr : 'SaveImgModalCtrl', templ: './views/mySaveImgModal.html'},
        meta: {contr: 'AddTagsModalCtrl', templ: './views/myAddTagsModal.html'},
        storage: {contr: 'ModifyAcctModalCtrl', templ: './views/myManageStoragesModal.html'},
        modify_storage: {contr: 'ModifyStorageModalCtrl', templ: './views/myModifyStorageModal.html'},
        add_storage: {contr: 'ModifyStorageModalCtrl', templ: './views/myAddStorageModal.html'},
        batch: {contr: 'BatchEditModalCtrl', templ: './views/myBatchEditModal.html'},
        video: {contr: 'VideoModalCtrl', templ: './views/myVideoModal.html'}
    };

    _appServicesFactory.setModal = function(option){

        return modals[option];

    };

    _appServicesFactory.buildMeta = function(obj){

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
                console.log('count conditions: ', conditions);
                $rootScope.queries_count = response.data[0].count;
            });

    };

    _appServicesFactory.selectTab = function(option){

        console.log('selecting tab: ', option);

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

        $rootScope.tab = option;
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

    _appServicesFactory.buildDropdowns = function($scope){

        $http.post('/dropdowns/build', $scope.form)
            .then(function(response){
                $scope.list.push(response.data);
            })

    };

    _appServicesFactory.initPiTSearch = function($scope, table){

        $scope.list = [];
        $scope.form = {};
        $scope.form.contract = true;
        $scope.form.option = 'year';
        $scope.form.table = table;
        $scope.searchArea = {};
        $scope.searchArea[table]=true;

        _appServicesFactory.buildDropdowns($scope);

    };

    _appServicesFactory.getCopy = function(lang, $scope){

        $http.get('./models/copy.json')
            .then(function(response){

                if(lang){
                    $rootScope.copy = response.data.views.private[lang];
                }
                else{
                    $rootScope.copy = response.data.views.admin;
                }
            })

    };


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
app.service('imageServices', ['$http','$rootScope', 'appServices', 'capInitialFilter', 'eventServices', 'replaceSingleQuoteFilter', function($http, $rootScope, appServices, capInitialFilter, eventServices, replaceSingleQuoteFilter){

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

    _imageServiceFactory.addImg = function($scope){

        $http.post('/images_mgmt/add', $rootScope.transientImage)
            .then(function(response){
                response.data.name == 'error' ? $scope.newImages[$rootScope.transientImage.file] = response.data.detail : $scope.newImages[$rootScope.transientImage.file] = false;
            })
            .then(function(response){
                $rootScope.transientImage = {};
                _imageServiceFactory.getUncategorisedImg();
                if($scope.activeTool === 'loadNewImages'){
                    $scope.loadNewImages();
                }
            })


    };

    _imageServiceFactory.addTags = function($scope, obj){

        var addTags = {};
        var addEvent = {};

        if(obj.event && obj.add_event){

            obj.event.img_id = obj.id;

            eventServices.postEvent($scope, obj.event);

        }

        if(obj.image && obj.add_tags) {

            obj.image.id = obj.id;

            for (var prop in obj.image) {
                if(obj.image[prop] && typeof obj.image[prop] !== 'number' ){
                    if(prop === 'meta' || prop === 'names' || prop === 'occasion'){
                        obj.image[prop] = capInitialFilter(obj.image[prop]);
                    }
                    obj.image[prop] = replaceSingleQuoteFilter(obj.image[prop]);
                }
            }
            _imageServiceFactory.addMeta($scope, obj.image);
        }
    };

    _imageServiceFactory.addMeta = function($scope, tags){

        tags ? tags = tags : tags = $rootScope.transientImage;

        $http.put('/images_mgmt/add_meta', tags)
            .then(function(response){
                _imageServiceFactory.getUncategorisedImg();
                $rootScope.transientImage = {};
                $rootScope.tags_form = {};
                $rootScope.img = {};
            })
            .then(function(response){
                $scope.runReInit();
            })
            .then(function(response){
                if($scope.activeTool === 'checkExif'){
                    $scope.checkExif();
                }
            })
    };

    _imageServiceFactory.getUncategorisedImg = function($scope){

        $http.get('/images_mgmt/get_new')
            .then(function(response){
                $rootScope.uncategorized = response.data;

            });
    };

    _imageServiceFactory.getImgById = function(id){

        $http.get('/images_mgmt/get_one/' + id)
            .then(function(response){
                $rootScope.img = response.data;

                $rootScope.tags_form.image = {};

                for(var prop in $rootScope.img){
                    if(typeof $rootScope.img[prop] != 'number' && prop != 'created' && prop != 'url' && prop != 'file' && prop != 'storage'){

                        $rootScope.tags_form.image[prop] = $rootScope.img[prop];

                    }
                }

                if(!$rootScope.img.event){
                    eventServices.getEventById(id);

                }

            });

    };

    _imageServiceFactory.batchEdit = function(obj, $scope){

        var batch = {};

        if(obj.country && obj.country.toLowerCase() === 'usa'){
            batch.country = 'United States';
        }

        for (var prop in obj) {
            if(obj[prop] && prop){
                batch[prop] = capInitialFilter(obj[prop]);
            }
        }

        $http.post('/images_mgmt/batch', batch)
            .then(function(response){
                _imageServiceFactory.getUncategorisedImg();
                $scope.runReInit();
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

    _imageServiceFactory.deleteImages = function(imageArray, $scope){

        $http.delete('/images_mgmt/' + imageArray)
            .then(function(response){
                _imageServiceFactory.getUncategorisedImg();
                $rootScope.img = {};
                $scope.runReInit();
            })

    };

    _imageServiceFactory.getDbCount = function($scope) {

        $http.get('/image_jobs/count/' + $rootScope.default_storage)
            .then(function(response){
                $scope.summaryCount.images = response.data.size;

            })

    };

    _imageServiceFactory.getExifData = function($scope) {

        $http.post('/exif/', $rootScope.transientImage)

            .then(function(response){

                for(var prop in response.data){
                    $rootScope.transientImage[prop] = response.data[prop];
                }

                switch ($scope.activeTool) {

                    case 'checkExif':

                        $rootScope.transientImage.meta.push('updated');

                        _imageServiceFactory.addMeta($scope);

                        break;

                    default:

                        _imageServiceFactory.addImg($scope);

                        break;
                }

            })

    };

    _imageServiceFactory.getVideos = function($scope){

        $http.get('/videos_mgmt/videos')
            .then(function(response){

                var dataArr = [];

                var data = {};
                data.length = 0;

                function addData(elem, year){
                    data[year].push('./buffalo/videos/' + elem);
                    data.length  ++;
                }

                response.data.forEach(function(elem,ind,arr){

                    var year = elem.split('_')[1].slice(0,4);

                    if(data[year]){
                        addData(elem, year);
                    }
                    else{
                        data[year] = [];
                        addData(elem, year);
                    }
                });

                //SORT FROM NEWEST TO OLDEST
                for(var prop in data){

                    var splitArr = [];

                    if(prop != 'length'){

                        data[prop].forEach(function(elem,ind,arr){

                            if(!splitArr[Math.floor(ind / 5)]){
                                splitArr[Math.floor(ind / 5)] = [];
                            }

                            splitArr[Math.floor(ind / 5)].push(elem);
                        })

                        var obj = {year: prop, videos: splitArr}
                        dataArr.unshift(obj);
                    }
                }

                dataArr.quantity = data.length;

                $scope.videos = dataArr;
                $scope.summaryCount.videos = dataArr.quantity;
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
    };

    this.getCopy = function(){
        $http.get('./models/publicCopy.json')
            .then(function(response){
                $rootScope.copy = response.data;
            })
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

}]);;
app.service('FUCK', ['$http','$rootScope','$scope', function($http, $rootScope, $scope){

    var _videoServiceFactory = {};

    _videoServiceFactory.getAll = function($scope){

        console.log('hello from videos')

    };


    return _videoServiceFactory;

}]);;app.directive('myEventHandler', function($timeout, $rootScope){

    return {
        restrict: 'EA',
        transclude: true,

        link: function(scope, element, attrs) {

            element.on('load', function(event){

                var loadMoment = Date.now();

                function delay(){
                    if((loadMoment - $rootScope.startMoment) > 5000){
                         return;
                    }
                    else {
                         return (5000 - (loadMoment - $rootScope.startMoment));
                    }
                }

                var footer = document.getElementsByClassName('footer');
                var header = document.getElementsByClassName('header');
                var body = document.getElementsByClassName('body');

                if(element.hasClass('paused')) {
                    angular.element(element).prop('src','');
                    angular.element(document.getElementsByTagName('img')).removeClass('paused');
                }

                else if(element.hasClass('loading')) {
                    angular.element(footer).find('#footer_id').text('ID: ' + $rootScope.events[scope.selector].id);
                    angular.element(footer).find('#footer_date').text($rootScope.events[scope.selector].created);
                    angular.element(footer).find('#footer_count').text(scope.selector + 1 + '/' + $rootScope.events.length);

                    if($rootScope.events[scope.selector].description){
                        angular.element(header).find('#header_text').text($rootScope.events[scope.selector].description);
                    }

                    angular.element(body).children('.current').addClass('loaded').removeClass('current');

                    angular.element(body).children('.next').addClass('current').removeClass('loading next');

                    angular.element(body).children('.loaded').addClass('next');

                    if(element.hasClass('playing')){
                        $timeout(function(){
                            $rootScope.startMoment = Date.now();
                            scope.callToAction('stepForward', 'eventHandler');
                        },delay());
                    }
                }

                else {
                    $rootScope.spinning = false;
                    var frame = document.getElementById('myFrame');
                    var tmpl = document.getElementById('privateTmpl');
                    angular.element(frame).css({'top': '15px', 'transition-duration': '1s'});
                    angular.element(tmpl).css({'position': 'fixed','opacity': '0.2'});
                }
            })

            element.on('error', function(event) {
                console.log('an error occurred \n', scope.pictureFrameMessage);
            })


        }
    }

});app.directive('insertBio', function(){

    return {
        restrict: 'E',
        scope: {
            thisSubject: '=info'
        },
        templateUrl: 'views/biography.html'
    };

});;app.directive('myASection', function(){

    return {
        restrict: 'EA',
        //scope: {
        //    subject: '=info'
        //},
        templateUrl: 'views/myASection.html'
    };

});;app.directive('myAddStorageModal', function(){

    return {
        restrict: 'EA'
    }
});;app.directive('myAddTagsModal', function(){

    return {
        restrict: 'EA',
        scope: {
            copy: '=info'
        }
    }
});;app.directive('myAvatarCard', function(){

    return {
        restrict: 'E',
        //scope: {
        //    subject: '=info'
        //},
        templateUrl: 'views/myAvatarCard.html'
    };

});;app.directive('myBSection', function(){

    return {
        restrict: 'E',
        //scope: {
        //    subject: '=info'
        //},
        templateUrl: 'views/myBSection.html'
    };

});;app.directive('myBatchEditModal', function(){

    return {
        restrict: 'EA'
    }
});;app.directive('myChangePwModal', function(){

    return {
        restrict: 'EA'
    }
});;app.directive('myGlobalNav', function(){

    return {
        restrict: 'E',

        scope: {
            globalTabs: '=info'
        },

        templateUrl: './views/myGlobalNavMenu.html'

    };
});
;app.directive('myLocalNav', function($rootScope){

    return {
        restrict: 'E',
        scope: {
            localTabs: '=info'
        },

        templateUrl: './views/myLocalNavMenu.html'

    };
});
;app.directive('myLoginModal', function($location, $anchorScroll){

    return  {
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
});;app.directive('myPictureFrame', function($rootScope){

    return {

        restrict: 'EA',
        transclude: true,
        templateUrl: './views/myPictureFrame.html',

        link: function(scope,element,attrs){
            element.on('click', function(event){
                if(event.target.firstChild && (event.target.firstChild.className === 'col-sm-4 outer' || event.target.firstChild.className === 'frameDef')){
                    scope.close();
                    scope.$parent.clear();
                }

                if(event.target.className === 'fa fa-close'){
                    scope.close();
                    scope.$parent.clear();
                }
            })
        }
    }

});app.directive('myResumeModal', function(){

    return {
        restrict: 'EA'
    };
});
;app.directive('mySaveImgModal', function(){

    return {
        restrict: 'EA'
    }
});;app.directive('myVideoModal', function(){

    return {
        restrict: 'EA',
        templateUrl: 'views/myVideoModal.html'

    };
});;app.directive('scrollTo', function($location, $anchorScroll){

    return function(scope, element, attrs){
        element.on('click', function(event){

            event.stopPropagation();

            scope.$on('$locationChangeStart', function (ev) {
                ev.preventDefault(false);
            });

            var location = attrs.scrollTo;
            $location.hash(location);

            var menu = document.getElementsByClassName('collapse');
            angular.element(menu).collapse('hide');

            $anchorScroll();

        })
    }
})