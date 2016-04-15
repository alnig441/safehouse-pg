var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';
var multer = require('multer');

var storage  = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './public/buffalo/' + call.setDate(file.originalname).getFullYear() + '/')
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
});
var upload = multer({storage: storage});


router.post('/add_img', call.isAuthenticated, function(req, res) {

    console.log('adding image: ', req.body);

    if (req.body.created == null) {
        req.body.created = call.setDate(req.body.url);
    }

    console.log('jim-bob', Date.parse(req.body.created));
    //POSTGRES REFACTOR SAVE IMAGE
    pg.connect(connectionString, function (err, client, done) {

        //var array = call.splitString(req.body.meta);
        var query = client.query("INSERT INTO images(url, created, year, month, day) values($1, $2, $3, $4, $5)", ['./buffalo/' + call.setDate(req.body.url).getFullYear() + '/' + req.body.url, req.body.created, req.body.created.getUTCFullYear(), req.body.created.getUTCMonth(), req.body.created.getUTCDate()], function (error, result) {
            if (error) {
                res.status(304).send(error);
            }
        })
        query.on('end', function (result) {
            res.status(200).send(result.rows);
        })
    })

})

router.post('/add_event', function(req, res, next){

    console.log('..adding event.. :', req.body);

    //if(req.body.created == null){
    //    req.body.created = call.setDate(req.body.url);
    //}

    pg.connect(connectionString, function (err, client, done) {

        var query = client.query("INSERT INTO events (event_da, event_en, img_id, updated) values($1, $2, $3, $4)", [req.body.event_da, req.body.event_en, req.body.img_id, req.body.updated], function (error, result) {
            if (error) {
                console.log('there was an error ', error);
                res.status(200).send(error.error);
            }
        })
        query.on('end', function (result) {
            client.end();
            res.status(200).send(result);
        })
    })

});

router.post('/upload', call.isAuthenticated, upload.single('file'), function(req, res, next){

    //console.log('upload: ', req.file);

    res.status(200);
});

router.get('/view', call.isAuthenticated, function(req, res){

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

router.post('/select', call.isAuthenticated, function(req, res){

    console.log('...event_crud/select.. ', req.body);

    if(req.body.month === 12){
        req.body.month = 0;
    }

    var x, y, z;
    req.body.year !== undefined ? x = true : x = false;
    req.body.month !== undefined ? y = true : y = false;
    req.body.day !== undefined ? z = true : z = false;

    var query_string;
    if(req.body.database === 'events'){
        query_string = 'SELECT * FROM events CROSS JOIN images WHERE events.img_id = images.id ORDER BY images.created ASC';
    }
    if(req.body.database === 'images'){
        query_string ='SELECT * FROM images WHERE meta IS NOT NULL ORDER BY created ASC';
    }

    pg.connect(connectionString, function(error, client, done){
        var array = [];
        var query = client.query(query_string, function(error, result){

                if(error){console.log(error);}
        })
        query.on('row', function(row){
            var date = new Date(row.created);
            console.log(row.created, x, y, z);
            if(x && y && z){
                if(date.getUTCFullYear() === req.body.year && date.getUTCMonth() === req.body.month && date.getUTCDate() === req.body.day){
                    array.push(row);
                }
            }
            else if(x && y) {
                if(date.getUTCFullYear() === req.body.year && date.getUTCMonth() === req.body.month) {
                    array.push(row);
                }
            }
            else if(x){
                if(date.getUTCFullYear() === req.body.year) {
                    array.push(row);
                }
            }
            else{
                array.push(row);
            }
        })
        query.on('end', function(result){

            client.end();
            if(req.body.meta !== undefined){
                req.body.meta = call.splitString(req.body.meta);
                array = call.selection(array, req.body);
                res.status(200).send(array);
            }
            else{
                res.status(200).send(array);
            }

        })
    })
});

router.get('/img', function(req, res, next){

    pg.connect(connectionString, function(error, client, done){
        var query = client.query('DECLARE geturl CURSOR FOR SELECT * FROM images ORDER BY id DESC; FETCH FIRST FROM geturl', function(error, result){
            if(error){
                console.log(error);
            }
        })
        query.on('end', function(result){
            client.end();
            res.status(200).send(result.rows);
        })
    })
});

router.get('/get_one/:img_id?', function(req, res, next){

    console.log('getting event by img_id: ', req.params);

    pg.connect(connectionString, function(error, client, done){
        var query = client.query('SELECT * FROM events WHERE img_id=' + parseInt(req.params.img_id), function(error, result){

           if(error){
               console.log(error);
           }
        });
        query.on('end', function(result){
            client.end();
            res.status(200).send(result.rows);
        })
    })
});

router.get('/img_get_one/:id?', function(req, res, next){

    pg.connect(connectionString, function(error, client, done){
        var query = client.query('SELECT * FROM images where id=' + parseInt(req.params.id), function(error, result){
            if(error){
                console.log(error);
            }
        });
        query.on('end', function(result){
            client.end();
            res.status(200).send(result.rows);
        })

    })
});

router.get('/img_all', function(req, res, next){

    pg.connect(connectionString, function(error, client, done){
        var query = client.query('SELECT * FROM images', function(error, result){
            if(error){
                console.log(error);
                res.status(200).send(error);
            }
        })
        query.on('end', function(result){
            client.end();
            res.status(200).send(result.rows);
        })
    })
});

router.put('/', function(req, res, next){

    console.log('..updating event ... ', req.body);

    pg.connect(connectionString, function(error, client, done){
        var query = client.query('UPDATE events SET (event_da, event_en) =($1, $2) WHERE img_id= $3 ', [req.body.event_da, req.body.event_en, req.body.img_id], function(error, result){
            if(error){
                console.log(error);
                res.status(200).send(error);
            }
        })
        query.on('end', function(result){
            client.end();
            res.status(200).send(result.rows);
        })
    })

});

router.put('/img_meta', function(req, res, next){

    console.log('...updating img meta ..', req.body);

    var array = call.splitString(req.body.meta);

    pg.connect(connectionString, function(error, client, done){
        var query = client.query('UPDATE images SET meta = $1 WHERE id = $2', [array, req.body.id], function(error, result){
            if(error){
                console.log(error);
                res.status(200).send(error);
            }
        })
        query.on('end', function(result){
            client.end();
            res.status(200).send(result.rows);
        })
    })
});

router.post('/date', function(req, res, next){

    console.log('...building BLAAAAH for ' + req.body.option, req.params);
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
    var opt = req.body.option;
    var array = [];
    var mySet = new Set();
    var query_string;
    if(req.body.database === 'events'){
        //query_string = 'SELECT images.created FROM images cross join events where images.id = events.img_id ORDER BY CREATED DESC';
        console.log('BINGO', req.body);
        pg.connect(connectionString, function(error, client, done){
            var query = client.query('SELECT images.created FROM images cross join events where images.id = events.img_id ORDER BY CREATED DESC', function(error, result){
                if(error){
                    res.status(200).send(error);
                }
            })
            query.on('row', function(row){
                var date = new Date(row.created);
                switch (opt) {
                    case 'year':
                        mySet.add(date.getUTCFullYear());
                        break;
                    case 'month':
                        if(date.getUTCFullYear() === req.body.year){
                            mySet.add(date.getUTCMonth());
                        }
                        break;
                    case 'day':
                        if(req.body.month == 12){
                            req.body.month = 0;
                        }
                        if(date.getUTCFullYear() === req.body.year && date.getUTCMonth() === req.body.month){
                            mySet.add(date.getUTCDate());
                        }
                        break;
                }
            })
            query.on('end',function(result){
                client.end();
                mySet.forEach(function(x, y, z){
                    if(x !== undefined){
                        switch (opt) {
                            case 'year':
                                array.push({year: x});
                                break;
                            case 'month':
                                if(x<10){
                                    var str = x.toString();
                                    x ='0' + str;
                                }
                                else{
                                    x = x.toString();
                                }
                                array.push(x);
                                break;
                            case 'day':
                                if(x<10){
                                    var str = x.toString();
                                    x ='0' + str;
                                }
                                else{
                                    x = x.toString();
                                }
                                array.push(x);
                                break;
                        }
                    }
                })

                if(opt === 'month' || opt === 'day'){
                    //array = array.sort();
                    var y = [];

                    if(opt === 'month'){
                        array.forEach(function(elem, ind, arr){
                            var x = opt;
                            y.push({month: parseInt(elem), name: months[parseInt(elem)]});
                        })
                    }
                    if(opt ==='day'){
                        array.forEach(function(elem, ind, arr){
                            var x = opt;
                            y.push({day: parseInt(elem)});
                        })
                    }
                    array = y;

                }
                console.log('...'+opt+' array..', array);
                res.status(200).send(array);
            })

        })


    }



    if(req.body.database === 'images'){
        console.log('images');
        //query_string = 'SELECT created FROM images ORDER BY CREATED DESC';

        console.log('BANKO', req.body);

        pg.connect(connectionString, function(error, client, done){
            var query = client.query('SELECT created FROM images ORDER BY CREATED DESC', function(error, result){
                if(error){
                    res.status(200).send(error);
                }
            })
            query.on('row', function(row){
                var date = new Date(row.created);
                switch (opt) {
                    case 'year':
                        mySet.add(date.getUTCFullYear());
                        break;
                    case 'month':
                        if(date.getUTCFullYear() === req.body.year){
                            mySet.add(date.getUTCMonth());
                        }
                        break;
                    case 'day':
                        if(req.body.month == 12){
                            req.body.month = 0;
                        }
                        if(date.getUTCFullYear() === req.body.year && date.getUTCMonth() === req.body.month){
                            mySet.add(date.getUTCDate());
                        }
                        break;
                }
            })
            query.on('end',function(result){
                client.end();
                mySet.forEach(function(x, y, z){
                    if(x !== undefined){
                        switch (opt) {
                            case 'year':
                                array.push({year: x});
                                break;
                            case 'month':
                                if(x<10){
                                    var str = x.toString();
                                    x ='0' + str;
                                }
                                else{
                                    x = x.toString();
                                }
                                array.push(x);
                                break;
                            case 'day':
                                if(x<10){
                                    var str = x.toString();
                                    x ='0' + str;
                                }
                                else{
                                    x = x.toString();
                                }
                                array.push(x);
                                break;
                        }
                    }
                })

                if(opt === 'month' || opt === 'day'){
                    //array = array.sort();
                    var y = [];

                    if(opt === 'month'){
                        array.forEach(function(elem, ind, arr){
                            var x = opt;
                            y.push({month: parseInt(elem), name: months[parseInt(elem)]});
                        })
                    }
                    if(opt ==='day'){
                        array.forEach(function(elem, ind, arr){
                            var x = opt;
                            y.push({day: parseInt(elem)});
                        })
                    }
                    array = y;

                }
                console.log('...'+opt+' array..', array);
                res.status(200).send(array);
            })

        })

    }


});

module.exports = router;

