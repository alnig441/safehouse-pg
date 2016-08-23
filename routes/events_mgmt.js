var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';
var qb = require('../public/javascripts/query_builder.js');

router.post('/add', call.isAuthenticated, function(req, res, next){

    var event = new qb(req, 'events');

    pg.connect(connectionString, function (err, client, done) {

        var query = client.query(event.insert(), function(error, result){
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

    console.log('yep');

    pg.connect(connectionString, function(error, client, done){
        //var query = client.query("select i.*, path || folder || '/' || file as url from events as i  cross join images cross join storages  where id = " + req.params.img_id, function(error, result){

        var query = client.query("select i.*, path || folder || '/' || file as url from events as i  cross join images cross join storages  where img_id = " + req.params.img_id + " and img_id = id", function(error, result){
            if(error){
                console.log(error);
            }
        })
        query.on('row', function(row){
            console.log('show me row: ', row);
            res.status(200).send(row);
        })
        query.on('end', function(result){
            client.end();
        })
    })
});

router.put('/', call.isAuthenticated, function(req, res, next){

    var event = new qb(req, 'events', 'img_id');

    pg.connect(connectionString, function(error, client, done){
        var query = client.query(event.update(), function(error, result){
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