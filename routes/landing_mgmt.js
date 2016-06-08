var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';

router.post('/', call.isAuthenticated, function(req, res, next){

    //console.log('in landing_mgmt', req.body);

    pg.connect(connectionString, function(err, client, done){
        var query = client.query('INSERT INTO tickers (created, headline, copy) VALUES ($1, $2, $3)', [req.body.date, req.body.headline, req.body.copy], function(error, result){
            if(error){
                res.status(200).send(error);
            }
        })
        query.on('end', function(result){
            res.status(200).send(result);
        })
    })

});


router.get('/', function(req, res, next){

    console.log('getting all tickers');

    pg.connect(connectionString, function(err, client, done){
        var query = client.query('SELECT * FROM tickers ORDER BY CREATED DESC', function(error, result){
            if(error){
                res.status(200).send(error);
            }
        })
        query.on('end', function(result){
            console.log('show me tickers: ', result.rows);
            res.status(200).send(result.rows);
        })
    })
});

module.exports = router;