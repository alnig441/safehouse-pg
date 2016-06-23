var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';
var fs = require('fs');

router.get('/all', call.isAuthenticated, function(req, res, next){

    pg.connect(connectionString, function(err, client, done){
        var query=client.query("select * from storages order by folder asc", function(error, result){
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

    console.log('adding storages: ', req.user, req.body);

    pg.connect(connectionString, function(err,  client, done){
        var query = client.query("INSERT INTO storages (folder, path, owner) values ($1, './buffalo/', $2)", [req.body.folder, req.user.username], function(error, result){
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

    console.log('updating: ', req.body);

    pg.connect(connectionString, function(err, client, done){
        var query = client.query("UPDATE storages SET owner = $1 WHERE folder = $2", [req.body.new_owner, req.body.folder], function(error, result){
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

//router.put('/delete', call.isAuthenticated, function(req, res, next){
router.delete('/:folder?', call.isAuthenticated, function(req, res, next){


        console.log('deleting ',req.params);

    pg.connect(connectionString, function(err, client, done){
        var query = client.query("DELETE FROM storages * WHERE folder = $1", [req.params.folder], function(error, result){
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