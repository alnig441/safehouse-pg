var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';

router.post('/add', call.isAuthenticated, function(req, res, next){

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

router.get('/:img_id?', call.isAuthenticated, function(req, res, next){

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

router.put('/', call.isAuthenticated, function(req, res, next){

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


module.exports = router;