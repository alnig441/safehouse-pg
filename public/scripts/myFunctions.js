var call = {
    setDate: function(string){
        var date;
        var tmp;
        string = string.toLowerCase();

        if(string.charAt(0)=='i' && string.charAt(1)=='m' && string.charAt(2)=='g' && string.length >= 23 ){
            var arr = [];
            string = string.slice(4,19);
            tmp = string.split('_');
            arr.push(tmp[0].slice(0,4));
            arr.push(tmp[0].slice(4,6));
            arr.push(tmp[0].slice(6,8));
            arr.push(tmp[1].slice(0,2));
            arr.push(tmp[1].slice(2,4));
            arr.push(tmp[1].slice(4,6));
            date = new Date([arr.slice(0,3).join('-'), arr.slice(3,6).join(':')].join('T'));
            date.setHours(date.getHours()+5);
        }
        else if (string.length >=19) {
            string = string.slice(0,19);
            string = string.split(' ');
            tmp = string[1].split('.');
            tmp = tmp.join(':');
            string.pop();
            string.push(tmp);
            date = new Date(string.join('T'));
            date.setHours(date.getHours()+5);
        }
        else {
            date = new Date();
        }

        console.log('setDate: ', date);
        return date;
    },
    parser: function(string){
        var temp = string.slice(1,11);
        var created = {};
        var arr = temp.split('-');
        var months =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var months_da =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Juni', 'Juli', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        created.en = arr[2] + ' ' + months[parseInt(arr[1]-1)] + ' ' + arr[0];
        created.da = arr[2] + ' ' + months_da[parseInt(arr[1]-1)] + ' ' + arr[0];
        return created;
    },
    splitString: function(meta){
        console.log('..splitstring..', meta);
        var separator = ' ';
        var temp = meta.toLowerCase().split(separator);
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


};

module.exports = call;