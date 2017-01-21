var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';
var qb = require('../public/javascripts/query_builder.js');

router.post('/tickers', call.isAuthenticated, function(req, res, next){

    var ticker = new qb(req, 'tickers');

    pg.connect(connectionString, function(err, client, done){
        var query = client.query(ticker.insert() , function(error, result){
            if(error){
                res.status(200).send(error);
            }
        })
        query.on('end', function(result){
            client.end();
            res.status(200).send(result);
        })
    })

});


router.get('/tickers', function(req, res, next){

    var records = new qb(req, 'tickers');
    var tickers = {};

    pg.connect(connectionString, function(err, client, done){
        var query = client.query(records.select(), function(error, result){
            if(error){
            res.status(200).send(error);
            console.log('show me the error: ', error);
            }
        })
        query.on('row', function(row){
            if(!req.params.owner){
                if(!tickers[row.owner]){
                    tickers[row.owner] = [];
                    tickers[row.owner].push(row);
                }
                else{
                    tickers[row.owner].push(row);
                }
            }
        })
        query.on('end', function(result){
            client.end();
            if(!req.params.owner){
                res.status(200).send(tickers);
            }
            else{
                res.status(200).send(result.rows);
            }
        })
    })
});

router.post('/projects', call.isAuthenticated, function(req, res, next){

    var project = new qb(req, 'resumes');

    pg.connect(connectionString, function(err, client, done){
        var query= client.query(project.insert(), function(error, result){
            if(error){
                res.status(200).send(error);
                console.log('Show me error: ', error);
            }
        })
        query.on('end', function(result){
            client.end();
            res.status(200).send(result);
        })
    })

});

router.get('/projects', function(req, res, next){

    var record = new qb(req, 'resumes');
    var resumes = {};

    pg.connect(connectionString, function(err, client, done){
        var query = client.query(record.select(), function(error, result){

                if(error){
                res.status(200).send(error);
                console.log('show me the error: ', error);
            }
        })
        query.on('row', function(row){
            if(!req.params.owner){
                if(!resumes[row.owner]){
                    resumes[row.owner] = [];
                    resumes[row.owner].push(row);
                }
                else{
                    resumes[row.owner].push(row);
                }
            }
        })
        query.on('end', function(result){
            client.end();
            if(!req.params.owner){
                res.status(200).send(resumes);
            }
            else{
                res.status(200).send(result.rows);
            }
        })
    })

});


router.get('/bios/all', function(req, res, next){

    var bios = new qb(req, 'biographies');
    var subjects = {};

    pg.connect(connectionString, function(err, client, done){
        var query = client.query(bios.select(), function(error, result){

                if(error){
                res.status(200).send(error);
            }
        })
        query.on('row', function(row){
            subjects[row.owner] = row;
        })
        query.on('end', function(result){
            client.end();
            res.status(200).send(subjects);

        })
    })

});

router.get('/bios/:owner?', function(req, res, next){

    var bio = new qb(req, 'biographies');

    pg.connect(connectionString, function(err, client, done){
        var query = client.query(bio.select(), function(error, result){

            if(error){
                res.status(200).send(error);
            }
        })
        query.on('end', function(result){
            client.end();
            res.status(200).send(result.rows[0]);

        })
    })

});


router.put('/bios', call.isAuthenticated, function(req, res, next){

    var bio = new qb(req, 'biographies', 'owner');

    pg.connect(connectionString, function(err, client, done){
        var query = client.query(bio.update(), function(error, result){
            if(error){
                res.status(200).send(error);
                console.log('show me the error: ', error);
            }
        })
        query.on('end', function(result){
            client.end();
            res.status(200).send(result.rows);
        })
    })

});

module.exports = router;