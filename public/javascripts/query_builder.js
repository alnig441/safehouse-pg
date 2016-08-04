
function Record (req, table, primaryKey) {

    this.request = req;
    this.table = table;

    if(req.user){
        this.user = req.user.username;
    }

    this.primaryKey = primaryKey;

    this.insert = function() {

        var parms = parseObj(this.request.body);
        var query = 'INSERT INTO '+ this.table + ' (' + parms.cols + ') VALUES (' + parms.vals + ')';
        return query;
    };

    this.delete = function() {

        var parms = parseObj(this.request.params);
        var query = 'DELETE FROM ' + this.table + ' * WHERE ' + parms.cols + ' = ' + parms.vals + '';
        return query;

    };

    this.update = function() {

        var parms = parseObj(this.request.body, this.primaryKey);
        var query = 'UPDATE ' + this.table + ' SET (' + parms.cols + ') = (' + parms.vals + ') WHERE ' + this.primaryKey + ' = ' + parms[this.primaryKey] + '';
        return query;
    };

    this.select = function() {

        var parms;
        var query;

        if(Object.keys(this.request.params).length > 0){
            parms = parseObj(this.request.params);
            query = 'SELECT * FROM ' + this.table + ' WHERE ' + parms.cols + ' = ' + parms.vals + '';
        } else {
            query = 'SELECT * FROM ' + this.table + '';
        }

        return query;

    };


    return ;

}

module.exports = Record;

function parseObj (obj, str) {

    var cols = [];
    var vals = [];
    var parms = {};


    for(var prop in obj){
        if(obj[prop] !== null && obj[prop] !== 'null'){
            if(str !== null && prop === str){
                parms[str] = "'" + obj[str] + "'";

            }else{
                cols.push(prop);
                vals.push("'" + obj[prop] + "'");
            }

        }
    }

    parms.cols = cols.toString();
    parms.vals = vals.toString();

    return parms;
}