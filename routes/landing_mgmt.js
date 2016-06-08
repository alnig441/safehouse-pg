var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';

router.post('/', call.isAuthenticated, function(req, res, next){

    console.log('in landing_mgmt', req.body);

    pg.connect(connectionString, function(err, client, done){
        var query = client.query('INSERT INTO tickers (created, created_str, headline, copy, owner) VALUES ($1, $2, $3, $4, $5)', [req.body.date, req.body.date_str, req.body.headline, req.body.copy, req.body.owner.name], function(error, result){
            if(error){
                res.status(200).send(error);
            }
        })
        query.on('end', function(result){
            res.status(200).send(result);
        })
    })

});


router.get('/:owner?', function(req, res, next){

    console.log('getting all tickers', req.params.owner);

    pg.connect(connectionString, function(err, client, done){
        var query = client.query("SELECT * FROM tickers WHERE OWNER = '"+ req.params.owner + "' ORDER BY CREATED DESC", function(error, result){
            if(error){
                res.status(200).send(error);
                console.log('show me the error: ', error);
            }
        })
        query.on('end', function(result){
            console.log('show me tickers: ', result.rows);
            res.status(200).send(result.rows);
        })
    })
});

module.exports = router;