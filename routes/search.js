var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';


router.post('/dropdown', function(req, res, next){

    console.log('..building dropdwon..', req.body);

    var option = req.body.option;
    var db = req.body.database;
    var array = [];
    var temp = [];
    var months = [
        {value: 12, da: 'Januar', en:'January'},
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
    db === 'events' ? query_string = 'SELECT images.created FROM images cross join events where images.id = events.img_id ORDER BY CREATED DESC' : query_string = 'SELECT created FROM images ORDER BY CREATED DESC' ;

    console.log(query_string);

    pg.connect(connectionString, function(error, client, done){
        var query = client.query(query_string, function(error, result){
            if(error){
                res.status(200).send(error);
            }
        })
        query.on('row', function(row){
            var date = new Date(row.created);
            switch (option){
                case 'year':
                    array.push(date.getUTCFullYear());
                    break;
                case 'month':
                    if(date.getUTCFullYear() === req.body.year){
                        array.push(date.getUTCMonth());
                    }
                    break;
                case 'day':
                    if(date.getUTCFullYear() === req.body.year && date.getUTCMonth() === req.body.month){
                        array.push(date.getUTCDate());
                    }
                    break;
            }
        })
        query.on('end', function(result){
            client.end();
            array.sort().reduce(function(prev, curr, index, array){
                prev = array[index -1];

                if(prev != curr){
                    temp.push(prev);
                }
                if(index === array.length -1){
                    temp.push(curr);
                }

            });
            array = [];
            temp.forEach(function(elem, ind, arr){
                switch (option){
                    case 'year':
                        array.push({year: elem});
                        break;
                    case 'month':
                        months.forEach(function(x, y, z){
                            if(elem === x.value){
                                console.log(elem, x.value);
                                array.push(x);
                            }
                        });
                        break;
                    case 'day':
                        array.push({day: elem});
                        break;
                }
            })
            console.log(array);
            res.status(200).send(array);

        })
    })

});

module.exports = router;