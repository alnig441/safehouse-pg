var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';

router.get('/latest', call.isAuthenticated, function(req, res){

    //POSTGRES REFACTOR GET LATEST EVENT
    pg.connect(connectionString, function(error, client, done){

        var event;
        var query = client.query("declare geturl cursor for select * from events cross join images where events.img_id = images.id order by images.created desc; fetch first from geturl", function(error, result){

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
        //console.log(req.body.month, typeof req.body.month);
        //if(req.body.month === 12){
        //    req.body.month = 0;
        //}
        month = true;
        search = search + " AND MONTH = "+ req.body.month;
    }
    if(typeof req.body.day === 'string'){
        req.body.day = parseInt(req.body.day);
        //console.log(req.body.day, typeof req.body.day);
        day = true;
        search = search + " AND DAY = " + parseInt(req.body.day);
    }

    //console.log(year, month, day, search);

    var query_string;
    if(req.body.database === 'events'){
        //query_string = 'SELECT * FROM events CROSS JOIN images WHERE events.img_id = images.id ORDER BY images.created ASC';
        query_string ="SELECT ID, EVENT_DA, EVENT_EN, CREATED, PATH || FOLDER || '/' || FILE AS URL FROM EVENTS CROSS JOIN IMAGES CROSS JOIN STORAGES WHERE IMG_ID = ID AND STORAGE = FOLDER AND META IS NOT NULL" + search + " ORDER BY CREATED";

    }
    if(req.body.database === 'images'){
        //query_string ='SELECT * FROM images WHERE meta IS NOT NULL ORDER BY created ASC';
        query_string ="SELECT ID, CREATED, PATH || FOLDER || '/' || FILE AS URL FROM IMAGES CROSS JOIN STORAGES WHERE STORAGE = FOLDER AND META IS NOT NULL" + search + " ORDER BY CREATED ASC";
    }

    console.log('query string: ', query_string);

    pg.connect(connectionString, function(error, client, done){
        var array = [];
        var query = client.query(query_string, function(error, result){

            if(error){console.log(error);}
        })
/*
        query.on('row', function(row){
            var date = new Date(row.created);
            //console.log('show me row: ', row);
            if(year && month && day){
                if(date.getUTCFullYear() === req.body.year && date.getUTCMonth() === req.body.month && date.getUTCDate() === req.body.day){
                    array.push(row);
                }
            }
            else if(year && month) {
                if(date.getUTCFullYear() === req.body.year && date.getUTCMonth() === req.body.month) {
                    array.push(row);
                }
            }
            else if(month && day){
                if(date.getUTCMonth() === req.body.month && date.getUTCDate() === req.body.day){
                    array.push(row);
                }
            }
            else if(year){
                if(date.getUTCFullYear() === req.body.year) {
                    array.push(row);
                }
            }
            else{
                array.push(row);
            }
        })
*/
        query.on('end', function(result){

            console.log('search/query results: ', result.rows);

            client.end();
            if(req.body.meta !== undefined){
                req.body.meta = call.splitString(req.body.meta);
                array = call.selection(array, req.body);
                //res.status(200).send(array);
                res.status(200).send(result.rows);
            }
            else{
                //res.status(200).send(array);
                res.status(200).send(result.rows);
            }

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
    //var array = [];
    //var temp = [];
    var months = [
        //{value: 12, da: 'Januar', en:'January'},
        {value: 0, da: 'Januar', en:'January'},
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

    //console.log('show me filter: ', filter);
    //db === 'events' ? query_string = 'SELECT images.created FROM images cross join events where images.id = events.img_id ORDER BY CREATED DESC' : query_string = 'SELECT created FROM images ORDER BY CREATED DESC' ;
    db === 'events' ? query_string = 'SELECT DISTINCT '+ option +' FROM events CROSS JOIN images where id = img_id'+ filter +' ORDER BY '+ option +' asc' : query_string = 'SELECT DISTINCT '+ option +' FROM images '+ filter +' ORDER BY '+ option +' asc' ;

    console.log(query_string);

    pg.connect(connectionString, function(error, client, done){
        var query = client.query(query_string, function(error, result){
            if(error){
                res.status(200).send(error);
            }
        })
/*
        query.on('row', function(row){
            var date = new Date(row.created);
            switch (option){
                case 'year':
                    array.push(date.getUTCFullYear());
                    break;
                case 'month':
                    if(date.getUTCFullYear() === req.body.year){
                        if(date.getUTCMonth() < 10){
                            //console.log(date.getUTCMonth());
                            if(date.getUTCMonth() === 0){
                                array.push(12);
                            }
                            else{
                                var x = '0' + date.getUTCMonth().toString();
                                array.push(x);
                            }
                        }
                        else{
                            array.push(date.getUTCMonth().toString());
                        }
                    }
                    break;
                case 'day':
                    if(date.getUTCFullYear() === req.body.year && date.getUTCMonth() === req.body.month){
                        if(date.getUTCDate() < 10){
                            var x = '0' + date.getUTCDate().toString();
                            array.push(x);
                        }
                        else {
                            array.push(date.getUTCDate().toString());
                        }
                    }
                    break;
            }
        })
*/
        query.on('end', function(result){
            //console.log('from postgres: ',result.rows);
            client.end();

            if(option === 'month'){
                result.rows.forEach(function(elem, ind, arr){
                    months.forEach(function(x, y, z){
                        if(elem.month === x.value){
                            result.rows[ind] = x;
                        }
                    })
                })
            }

/*
            if(array.length > 1){
                array.sort().reduce(function(prev, curr, index, array){
                    //console.log(prev, curr, index, array);
                    prev = array[index -1];

                    if(prev != curr){
                        temp.push(prev);
                    }
                    if(index === array.length -1){
                        temp.push(curr);
                    }

                });
            }
            else{
                temp = array;
            }
            //console.log('2: ', temp);
            array = [];
            temp.forEach(function(elem, ind, arr){
                switch (option){
                    case 'year':
                        array.push({year: elem});
                        break;
                    case 'month':
                        months.forEach(function(x, y, z){
                            if(parseInt(elem) === x.value){
                                //console.log(elem, x.value);
                                array.push(x);
                                if(parseInt(elem)===12){
                                    array.unshift(x);
                                    array.pop();
                                }
                            }
                        });
                        break;
                    case 'day':
                        array.push({day: elem});
                        break;
                }
            })
*/
            console.log('hernede du:', result.rows);
            res.status(200).send(result.rows);

        })
    })

});

module.exports = router;