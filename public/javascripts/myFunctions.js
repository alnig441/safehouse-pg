var call = {

    buildQBObj: function(obj){

        console.log('call fn: ', obj);

        var qbObj = {};
        var tmp;
        var hour;
        var min;
        var sec;

        for(var prop in obj){
            if(obj[prop]){
                    qbObj[prop] = obj[prop];
            }
        }

        if(qbObj.created){
            qbObj.created = new Date(obj.created);
            qbObj.year = qbObj.created.getUTCFullYear(qbObj.year);
            qbObj.month = qbObj.created.getUTCMonth(qbObj.month);
            qbObj.month = qbObj.month.toString();
            qbObj.day = qbObj.created.getUTCDate(qbObj.day);
            qbObj.created = qbObj.created.toJSON();

        }else{
            qbObj.created = 'no timestamp available';
        }

        return qbObj;
    },

    parser: function(/*string*/ row, lang){

        var created = {};
        var months =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var months_da =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Juni', 'Juli', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        switch (lang) {
            case 'en':
                created = row.day + ' ' + months[parseInt(row.month)] + ' ' + row.year;
                break;
            case 'da':
                created = row.day + ' ' + months_da[parseInt(row.month)] + ' ' + row.year;
                break;
        }
        return created;
    },

    splitString: function(meta){
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

    }

    //UNUSED

    //build_set: function(obj, date){
    //
    //    var mySet = new Set();
    //
    //    switch (obj.option) {
    //        case 'year':
    //            mySet.add(date.getUTCFullYear());
    //            break;
    //        case 'month':
    //            if(date.getUTCFullYear() === req.body.year){
    //                mySet.add(date.getUTCMonth());
    //            }
    //            break;
    //        case 'day':
    //            if(date.getUTCFullYear() === req.body.year && date.getUTCMonth() === req.body.month){
    //                mySet.add(date.getUTCDate());
    //            }
    //            break;
    //    }
    //
    //    return mySet;
    //
    //}

    //UNUSED

    //build_obj: function(array){
    //
    //    var str ;
    //
    //    if(array){
    //        str = '';
    //        array.forEach(function(elem, ind, arr){
    //            str += "'" + elem + "'";
    //            if(ind < array.length -1){
    //                str += ",";
    //            }
    //        });
    //
    //        return str;
    //    }
    //
    //    return;
    //
    //}

};

module.exports = call;