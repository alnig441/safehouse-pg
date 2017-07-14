
function Record (req, table, primaryKey, arrays) {

    this.request = req;
    this.table = table;

    if(req.user){
        this.user = req.user.username;
    }

    this.primaryKey = primaryKey;
    this.arrays = arrays;

    this.insert = function() {

        var parms = parseObj(this.request.body, this.primaryKey, this.arrays);
        var query = 'INSERT INTO '+ this.table + ' (' + parms.cols + ') VALUES (' + parms.vals + ')';
        return query;
    };

    this.delete = function() {

        var query = 'DELETE FROM ' + this.table + ' WHERE ';
        var parms = parseObj(this.request.params);

        if(parms.vals.split(',').length > 1){

            parms.vals.split(',').forEach(function(elem,ind){
                if(elem){
                    if(ind === 0){
                        query += parms.cols + ' = ' + elem ;
                    }else{
                        query += "'" + ' OR ' + parms.cols + " = '" + elem ;
                    }
                }
            });
        }
        else{
            query += '' + parms.cols + ' = ' + parms.vals + '';
        }

        return query;

    };

    this.update = function() {

        var tmp = this.request.body.id;
        var isArray = false;

        if(typeof tmp === 'string' && tmp.split(',').length >1) {
            this.request.body.id = tmp.split(',');
            isArray = true;
        }

        var parms = parseObj(this.request.body, this.primaryKey, this.arrays);
        var query;

        if(isArray){
            query = 'UPDATE ' + this.table + ' SET (' + parms.cols + ') = (' + parms.vals + ') WHERE ' + parms.ids;
        }
        else {
            query = 'UPDATE ' + this.table + ' SET (' + parms.cols + ') = (' + parms.vals + ') WHERE ' + this.primaryKey + ' = ' + parms[this.primaryKey] + '';
        }

        return query;
    };

    this.select = function(sort) {

        var parms;
        var query;

        if(Object.keys(this.request.params).length > 0){
            parms = parseObj(this.request.params);
            query = 'SELECT * FROM ' + this.table + ' WHERE ' + parms.cols + ' = ' + parms.vals + '';
        } else {
            query = 'SELECT * FROM ' + this.table + '';
        }

        if(sort){
            query += ' ORDER BY ' + Object.keys(sort) + ' ' + sort[Object.keys(sort)];
        }

        return query;

    };


    return ;

}

module.exports = Record;

function parseObj (obj, str, arr) {

    var cols = [];
    var vals = [];
    var parms = {};

    for(var prop in obj){

        if(obj[prop]){

            if(str && prop === str){

                if(Array.isArray(obj[prop])) {
                    parms.ids = batch(prop, obj[prop]);
                    }
                else {
                    parms[str] = "'" + obj[str] + "'";
                }
            }

            else{

                if(compare(prop, arr)){

                    cols.push(prop);
                    vals.push(breakout(obj[prop]));
                }

                else {

                    cols.push(prop);
                    vals.push("'" + obj[prop] + "'");
                }

            }

        }
    }

    parms.cols = cols.toString();
    parms.vals = vals.toString();

    return parms;
}

function breakout (str) {


    // TAKE INCOMING PARAMETER STR AND PARSE IT INTO AN ARRAY TO BE STORED IN THE SPECIFIED TABLE COLUMN

    var arr;
    var tmpStr;
    var tmpArr = [];

    if(Array.isArray(str)){
        arr = str;
    } else {
        arr = str.split(',');
    }

    arr.forEach(function(elem, ind, arr){
        tmpArr.push("'" + elem.trim() + "'");
    });

    tmpStr = "array[" + tmpArr.toString() +"]";

    return tmpStr;
}

function compare (prop, arr){

    // DETERMINE IF PROP IS AN ARRAY, RETURN TRUE IF SO

    var incr = 0;

    if(arr){

        arr.forEach(function(elem, ind){
            if(elem == prop){
                incr ++;
            }
        });

    }

    if(incr > 0){
        return true;
    }
    else {
        return false;
    }

}

function batch (property, array) {

    // SET BATCH LOAD IDs

    var str = '';

    array.forEach(function(elem, ind, arr){
        if(ind < array.length - 1){
            str += property + '=' + elem + ' OR ';
        }
        else {
            str += property + '=' + elem;
        }
    });

    return str;
}