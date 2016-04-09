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

    //POSTGRES REFACTOR SAVE IMAGE
    pg.connect(connectionString, function (err, client, done) {

        var array = call.splitString(req.body.meta);
        var query = client.query("INSERT INTO images(url, created, meta) values($1, $2, $3)", ['./buffalo/' + call.setDate(req.body.url).getFullYear() + '/' + req.body.url, req.body.created, array], function (error, result) {
            if (error) {
                res.send(error.detail);
            }
        })
        query.on('end', function (result) {
            res.status(200).send(result.rows);
        })
    })

})

router.post('/add_event', function(req, res, next){

    if(req.body.created == null){
        req.body.created = call.setDate(req.body.url);
    }

    pg.connect(connectionString, function (err, client, done) {

        var query = client.query("INSERT INTO events (event_da, event_en, url, created) values($1, $2, $3, $4)", [req.body.event_da, req.body.event_en, './buffalo/' + call.setDate(req.body.url).getFullYear() + '/' + req.body.url, req.body.created], function (error, result) {
            if (error) {
                console.log('there was an error ', error);
                res.status(200).send(error.error);
            }
        })
        query.on('end', function (result) {
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
        var query = client.query("DECLARE geturl CURSOR FOR SELECT * FROM events ORDER BY created DESC; FETCH FIRST FROM geturl", function(error, result){
            if(error){ console.log('theres was an error ', error.detail);}
        })
        query.on('row', function(row){
            event = row;
            event.created = call.parser(JSON.stringify(row.created));
        })

        query.on('end', function(result){
            res.send(event);
        })
    })


    //POSTGRES REFACTOR GET LATEST EVENT END

});

router.post('/select', call.isAuthenticated, function(req, res){

    pg.connect(connectionString, function(error, client, done){
        var array = [];
        var query = client.query('SELECT * FROM ' + req.body.database + ' ORDER BY created ASC', function(error, result){
            if(error){console.log(error);}
        })
        query.on('row', function(row){
            array.push(row);
        })
        query.on('end', function(result){
            client.end();
            if(req.body.meta){
                req.body.meta = call.splitString(req.body.meta);
            }
            array = call.selection(array, req.body);
            res.send(array);
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

module.exports = router;

