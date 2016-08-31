
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

        var parms = parseObj(this.request.params);
        var query = 'DELETE FROM ' + this.table + ' * WHERE ' + parms.cols + ' = ' + parms.vals + '';
        return query;

    };

    this.update = function() {

        var parms = parseObj(this.request.body, this.primaryKey, this.arrays);
        var query;

        if(Array.isArray(this.request.body.id)){
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

        if(sort !== undefined){
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
        if(obj[prop] !== null && obj[prop] !== 'null'){

            if((str !== null || str !== undefined) && prop === str){
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

    // TAKE INCOMING PARAMETER STR AND PARSE IT INTO AN ARRAY TO BE STRORED IN THE SPECIFIED TABLE COLUMN

    var arr = str.split(',');
    var tmpStr;
    var tmpArr = [];

    arr.forEach(function(elem, ind, arr){
        tmpArr.push("'" + elem.trim() + "'");
    });

    tmpStr = "array[" + tmpArr.toString() +"]";

    return tmpStr;
}

function compare (prop, arr){

    // DETERMINE IF PROP IS AN ARRAY, RETURN TRUE IF SO

    var incr = 0;

    if(arr !== 'undefined' && arr !== undefined){

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