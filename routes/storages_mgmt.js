var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';
//var storagePath = process.env.STORAGE_PATH;
var fs = require('fs');
var qb = require('../public/javascripts/query_builder.js');

router.get('/all', call.isAuthenticated, function(req, res, next){

    var storage = new qb(req, 'storages');

    pg.connect(connectionString, function(err, client, done){
        var query=client.query(storage.select(), function(error, result){
            if(err){
                console.log(error);
            }
            query.on('end', function(result){
                client.end();
                res.status(200).send(result.rows);
            })
        })
    })
});

router.post('/add', call.isAuthenticated, function(req, res, next){

    var storage = new qb(req, 'storages');

    pg.connect(connectionString, function(err,  client, done){
        var query = client.query(storage.insert(), function(error, result){
            if(error){
                console.log(error);
            }
        })
        query.on('end', function(result){
            client.end();
            res.status(200).send(result);
        })
    })
});

router.put('/update', call.isAuthenticated, function(req, res, next){

    var storage = new qb(req, 'storages', 'folder');

    pg.connect(connectionString, function(err, client, done){
        var query=client.query(storage.update(), function(error, result){
            if(error){
                console.log(error);
            }
        })
        query.on('end', function(result){
            client.end();
            res.status(200).send(result);
        })
    })
});

router.delete('/:folder?', call.isAuthenticated, function(req, res, next){

    var storage = new qb(req, 'storages');

    pg.connect(connectionString, function(err, client, done){
        var query = client.query(storage.delete(), function(error, result){
            if(error){
                console.log(error);
            }
        })
        query.on('end', function(result){
            client.end();
            res.status(200).send(result);
        })
    })

});

module.exports = router;