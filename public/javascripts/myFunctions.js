var call = {

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