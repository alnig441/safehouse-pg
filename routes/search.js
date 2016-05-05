var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';

router.get('/latest', call.isAuthenticated, function(req, res){

    //POSTGRES REFACTOR GET LATEST EVENT
    pg.connect(connectionString, function(error, client, done){

        var event;
        var query = client.query("declare geturl cursor for select id, created, event_da, event_en, path || folder || '/' || file as url from events cross join images cross join storages where img_id = id and storage = folder order by created desc; fetch first from geturl", function(error, result){

            if(error){ console.log('theres was an error ', error.detail);}
        })
        query.on('row', function(row){
            event = row;
            event.created = call.parser(JSON.stringify(row.created));
        })

        query.on('end', function(result){
            client.end();
            res.send(event);
        })
    })

    //POSTGRES REFACTOR GET LATEST EVENT END
});


router.post('/query', call.isAuthenticated, function(req, res){

    console.log('...search/query.. ', req.body);

    var year = false;
    var month = false;
    var day = false;
    var search = "";

    if(typeof req.body.year === 'number' && !req.body.date){
        year = true;
        search = search + " AND YEAR = " + req.body.year;
    }
    if(typeof req.body.month === 'number'){
        if(req.body.month === 12){
            req.body.month = 0;
        }
        month = true;
        search = search + " AND MONTH = "+ req.body.month;
    }
    if(typeof req.body.day === 'number'){
        day = true;
        search = search + " AND DAY = " + req.body.day;
    }

    if(req.body.meta !== undefined){
        var arr = req.body.meta.split(' ');
        arr.forEach(function(elem, ind, arr){
            search += " and '"+ elem.toLowerCase() +"'= any (meta)";
        })

    }

    var query_string;
    if(req.body.database === 'events'){
        query_string ="SELECT ID, EVENT_DA, EVENT_EN, CREATED, PATH || FOLDER || '/' || FILE AS URL FROM EVENTS CROSS JOIN IMAGES CROSS JOIN STORAGES WHERE IMG_ID = ID AND STORAGE = FOLDER AND META IS NOT NULL" + search + " ORDER BY CREATED";

    }
    if(req.body.database === 'images'){
        query_string ="SELECT ID, CREATED, PATH || FOLDER || '/' || FILE AS URL FROM IMAGES CROSS JOIN STORAGES WHERE STORAGE = FOLDER AND META IS NOT NULL" + search + " ORDER BY CREATED ASC";
    }

    console.log('..seach/query query string: ', query_string);

    pg.connect(connectionString, function(error, client, done){
        var array = [];
        var query = client.query(query_string, function(error, result){

            if(error){console.log(error);}
        })
        query.on('end', function(result){

            client.end();
/*
            if(req.body.meta !== undefined){
                req.body.meta = call.splitString(req.body.meta);
                array = call.selection(array, req.body);
                res.status(200).send(result.rows);
            }
            else{
                res.status(200).send(result.rows);
            }
*/
            res.status(200).send(result.rows);

        })
    })
});

router.post('/dropdown', function(req, res, next){

    console.log('..building dropdwon..', req.body);

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

    console.log(query_string);

    pg.connect(connectionString, function(error, client, done){
        var query = client.query(query_string, function(error, result){
            if(error){
                res.status(200).send(error);
            }
        })
        query.on('end', function(result){
            console.log('printing '+ option +'s:', result.rows);
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

            console.log('sending rows: ', result.rows);
            res.status(200).send(result.rows);

        })
    })

});

module.exports = router;