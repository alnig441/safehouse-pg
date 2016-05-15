var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';


router.post('/build', call.isAuthenticated, function(req, res, next){

    if(req.body.month === 12){
        req.body.month = 0;
    }

    var option = req.body.option;
    var db = req.body.database;
    var months = [
        {value: 12, da: 'Januar', en:'January'},
        //{value: 0, da: 'Januar', en:'January'},
        {value: 1, da: 'Februar', en:'February'},
        {value: 2, da: 'Marts', en: 'March'},
        {value: 3, da: 'April', en:'April'},
        {value: 4, da: 'Maj', en:'May'},
        {value: 5, da: 'Juni', en:'June'},
        {value: 6, da: 'Juli', en:'July'},
        {value: 7, da: 'August', en:'August'},
        {value: 8, da: 'September', en:'September'},
        {value: 9, da: 'Oktober', en:'October'},
        {value: 10, da: 'November', en:'November'},
        {value: 11, da: 'December', en:'December'}
    ];
    var query_string;
    var filter = "";

    switch (option) {
        case 'month':
            db === 'images' ? filter += " where year = "+ req.body.year : filter += " and year = "+ req.body.year;
            break;
        case 'day':
            db === 'images' ? filter += " where year = "+ req.body.year +" and month = "+req.body.month : filter += " and year = "+ req.body.year +" and month = "+req.body.month;
            break;
    }

    db === 'events' ? query_string = 'SELECT DISTINCT '+ option +' FROM events CROSS JOIN images where id = img_id'+ filter +' ORDER BY '+ option +' asc' : query_string = 'SELECT DISTINCT '+ option +' FROM images '+ filter +' ORDER BY '+ option +' asc' ;

    pg.connect(connectionString, function(error, client, done){
        var query = client.query(query_string, function(error, result){
            if(error){
                res.status(200).send(error);
            }
        })
        query.on('end', function(result){
            client.end();

            if(option === 'month'){
                result.rows.forEach(function(elem, ind, arr){
                    if(elem.month === 0){
                        result.rows[ind].month = 12;
                    }
                    months.forEach(function(x, y, z){
                        if(elem.month === x.value){
                            result.rows[ind] = x;
                        }
                    })
                })
            }
            res.status(200).send(result.rows);

        })
    })

});

module.exports = router;