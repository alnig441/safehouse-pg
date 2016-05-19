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


router.post('/', call.isAuthenticated, function(req, res){

    console.log('enter query: ', req.body);

    var search = "";

    if(req.body.type_and || req.body.type_or){
        for(var prop in req.body){
            if(typeof req.body[prop] === 'object' && req.body[prop].length > 0){
                if(req.body.type_and){
                    if(prop === 'meta' || prop === 'names'){
                        req.body[prop].forEach(function(elem, ind, arr){
                            search += " AND '"+ elem +"'= ANY("+prop+")";
                        })
                    }
                    else{
                        req.body[prop].forEach(function(elem, ind, arr){
                            search += " AND "+ prop + "='"+elem+"'";
                        })
                    }
                }
                if(req.body.type_or){
                    if(prop === 'baseline'){
                        for(var key in req.body[prop]){
                            if(key === 'names' || key === 'meta'){
                                search += " AND '"+ req.body[prop][key] +"' = ANY("+key+")"
                            }
                        }
                    }
                    else if(prop === 'meta' || prop === 'names'){
                        req.body[prop].forEach(function(elem, ind, arr){
                            search += " OR '"+ elem +"'= ANY("+prop+")";
                        })
                    }
                    else{
                        req.body[prop].forEach(function(elem, ind, arr){
                            search += " OR "+ prop + "='"+elem+"'";
                        })
                    }
                }
            }
        }
    }

    console.log('give me search string: ', search);


    if (typeof req.body.year === 'number' && !req.body.date) {
        search = search + " AND YEAR = " + req.body.year;
    }
    if (typeof req.body.month === 'number') {
        if (req.body.month === 12) {
            req.body.month = 0;
        }
        search = search + " AND MONTH = " + req.body.month;
    }
    if (typeof req.body.day === 'number') {
        search = search + " AND DAY = " + req.body.day;
    }

    //if (req.body.meta !== undefined) {
    //    var arr = req.body.meta.split(' ');
    //    arr.forEach(function (elem, ind, arr) {
    //        search += " and '" + elem.toLowerCase() + "'= any (meta)";
    //    })
    //
    //}

    var query_string;

    if(req.body.database === 'events'){
        query_string ="SELECT ID, EVENT_DA, EVENT_EN, CREATED, PATH || FOLDER || '/' || FILE AS URL FROM EVENTS CROSS JOIN IMAGES CROSS JOIN STORAGES WHERE IMG_ID = ID AND STORAGE = FOLDER AND META IS NOT NULL" + search + " ORDER BY CREATED";

    }
    if(req.body.database === 'images'){
        query_string ="SELECT ID, CREATED, PATH || FOLDER || '/' || FILE AS URL FROM IMAGES CROSS JOIN STORAGES WHERE STORAGE = FOLDER AND META IS NOT NULL" + search + " ORDER BY CREATED ASC";
    }

    console.log('query string: ', query_string);

    pg.connect(connectionString, function(error, client, done){
        var query = client.query(query_string, function(error, result){

            if(error){console.log(error);}
        })
        query.on('end', function(result){

            client.end();
            res.status(200).send(result.rows);

        })
    })
});


router.put('/type', call.isAuthenticated, function(req, res, next){

    console.log('in type: ', req.body);

});

module.exports = router;