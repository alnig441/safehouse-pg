var call = {

    buildQBObj: function(obj){

        var qbObj = {};
        var tmp;
        var hour;
        var min;
        var sec;

        for(var prop in obj){
            if(obj[prop] !== null && obj[prop] !== 'null'){
                qbObj[prop] = obj[prop];
            }
        }

        if(!qbObj.created){

            if(obj.file.split(' ')[0].split('-').length == 3){
                tmp = obj.file.split(' ')[0].split('-');
                qbObj.year = tmp[0];
                qbObj.month = tmp[1] - 1;
                qbObj.day = tmp[2];
                tmp = obj.file.split(' ')[1].split('.');
                hour = tmp[0];
                min = tmp[1];
                sec = tmp[2];

            }
            else if(obj.file.split('_').length >= 3 && obj.file.split('_')[1].length == 8 && obj.file.split('_')[2].length >= 6){
                tmp = obj.file.split('_')[1];
                qbObj.year = tmp.slice(0,4);
                qbObj.month = tmp.slice(4,6) - 1;
                qbObj.day = tmp.slice(6,8);
                tmp = obj.file.split('_')[2];
                hour = tmp.slice(0,2);
                min = tmp.slice(2,4);
                sec = tmp.slice(4,6);
            }

            qbObj.created = new Date();
            qbObj.created.setUTCFullYear(qbObj.year);
            qbObj.created.setUTCMonth(qbObj.month);
            qbObj.created.setUTCDate(qbObj.day);
            qbObj.created.setUTCHours(hour);
            qbObj.created.setUTCMinutes(min);
            qbObj.created.setUTCSeconds(sec);
        }
        else{
            qbObj.created = new Date(obj.created);
            qbObj.year = qbObj.created.getUTCFullYear(qbObj.year);
            qbObj.month = qbObj.created.getUTCMonth(qbObj.month);
            qbObj.day = qbObj.created.getUTCDate(qbObj.day);

        }

        if(qbObj.created != 'Invalid Date'){
            qbObj.created = qbObj.created.toJSON();
        }

        return qbObj;
    },

    parser: function(string, lang){
        var temp = string.slice(1,11);
        var created = {};
        var arr = temp.split('-');
        var months =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var months_da =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Juni', 'Juli', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        //created.en = arr[2] + ' ' + months[parseInt(arr[1]-1)] + ' ' + arr[0];
        //created.da = arr[2] + ' ' + months_da[parseInt(arr[1]-1)] + ' ' + arr[0];
        switch (lang) {
            case 'en':
                created = arr[2] + ' ' + months[parseInt(arr[1]-1)] + ' ' + arr[0];
                break;
            case 'da':
                created = arr[2] + ' ' + months_da[parseInt(arr[1]-1)] + ' ' + arr[0];
                break;
        }
        return created;
    },

    splitString: function(meta){
        console.log('..splitstring..', meta);
        var separator = ',';
        var temp = meta.split(separator);
        return temp;
        },

    isAuthenticated: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
            }
        res.send('unauthorized OR session expired - log in again');

        },

    selection: function(dbDump , query){
        console.log('..myfunctions..', dbDump, query);
        var temp =[];
        if(query.database == 'events'){
            dbDump.forEach(function(element, index, array){
                var date = element.created;
                if((date.getMonth()+1 == query.month) && (date.getFullYear() == query.year)){
                    temp.push(element);
                }
            });
            return temp;

        }
        if(query.database == 'images'){
            console.log('SES DETTE??');
            dbDump.forEach(function(element, index, array){
                var incr = 0;

                    element.meta.forEach(function(elem, index, array){

                        for(var i = 0; i<query.meta.length; i++ ){
                            if(elem == query.meta[i]){
                                incr++;
                                if(incr == query.meta.length){
                                    temp.push(element);
                                }

                            }
                        }

                    });


            });
            return temp;

        }

    },

    build_set: function(obj, date){

        var mySet = new Set();

        switch (obj.option) {
            case 'year':
                mySet.add(date.getUTCFullYear());
                break;
            case 'month':
                if(date.getUTCFullYear() === req.body.year){
                    mySet.add(date.getUTCMonth());
                }
                break;
            case 'day':
                if(date.getUTCFullYear() === req.body.year && date.getUTCMonth() === req.body.month){
                    mySet.add(date.getUTCDate());
                }
                break;
        }

        return mySet;

    },

    build_obj: function(array){

        var str = '';
        array.forEach(function(elem, ind, arr){
            str += "'" + elem + "'";
            if(ind < array.length -1){
                str += ",";
            }
        });
        return str;

    }

};

module.exports = call;