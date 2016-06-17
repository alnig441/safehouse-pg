var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';

router.post('/tickers', call.isAuthenticated, function(req, res, next){

    console.log('in landing_mgmt', req.body);

    pg.connect(connectionString, function(err, client, done){
        var query = client.query('INSERT INTO tickers (created, created_str, headline, copy, owner) VALUES ($1, $2, $3, $4, $5)', [req.body.date, req.body.date_str, req.body.headline, req.body.copy, req.body.owner], function(error, result){
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


router.get('/tickers/:owner?', function(req, res, next){

    console.log('getting all tickers', req.params.owner);

    var query_str;
    var tickers = {};

    switch (req.params.owner) {
        case undefined:
            query_str = "SELECT * FROM tickers ORDER BY created DESC";
            break;
        default:
            query_str = "SELECT * FROM tickers WHERE OWNER = '"+ req.params.owner + "' ORDER BY created DESC";
            break;
    }

    pg.connect(connectionString, function(err, client, done){
        var query = client.query(query_str, function(error, result){
            if(error){
            res.status(200).send(error);
            console.log('show me the error: ', error);
            }
        })
        query.on('row', function(row){
            if(req.params.owner === undefined){
                if(tickers[row.owner] === undefined){
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
            console.log('show me tickers: ', result.rows);
            if(req.params.owner === undefined){
                res.status(200).send(tickers);
            }
            else{
                res.status(200).send(result.rows);
            }
        })
    })
});

router.post('/projects', call.isAuthenticated, function(req, res, next){

    console.log('posting project: ', req.body);

    var cols = [];
    var vals_arr = [];
    var vals = '';

    for(var prop in req.body){
        if(req.body[prop] !== null && req.body[prop] !== 'null'){
            cols.push(prop);
            vals_arr.push("'" + req.body[prop] + "'");
        }
    }

    vals = vals_arr.join(',');

    pg.connect(connectionString, function(err, client, done){
        var query = client.query('INSERT INTO resumes ('+cols+') VALUES ('+vals+')', function(error, result){
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

router.get('/projects/:owner?', function(req, res, next){

    console.log('getting projects for ', req.params.owner);
    var query_str;
    var resumes = {};

    switch (req.params.owner) {
        case undefined:
            query_str = "SELECT * FROM resumes ORDER BY begin_date DESC";
            break;
        default:
            query_str = "SELECT * FROM resumes WHERE OWNER = '"+ req.params.owner + "' ORDER BY begin_date DESC";
            break;
    }

    pg.connect(connectionString, function(err, client, done){
        var query = client.query(query_str, function(error, result){

                if(error){
                res.status(200).send(error);
                console.log('show me the error: ', error);
            }
        })
        query.on('row', function(row){
            if(req.params.owner === undefined){
                if(resumes[row.owner] === undefined){
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
            if(req.params.owner === undefined){
                res.status(200).send(resumes);
            }
            else{
                res.status(200).send(result.rows);
            }
        })
    })

});


router.get('/bios/all', function(req, res, next){

    var subjects = {};

    pg.connect(connectionString, function(err, client, done){
        var query = client.query("SELECT * FROM biographies ORDER BY OWNER ASC", function(error, result){

                if(error){
                res.status(200).send(error);
            }
        })
        query.on('row', function(row){
            console.log('in bios getting gotting rows: ',row );
            subjects[row.owner] = row;
        })
        query.on('end', function(result){
            client.end();
            res.status(200).send(subjects);

        })
    })

});

router.get('/bios/:owner?', function(req, res, next){

    pg.connect(connectionString, function(err, client, done){
        var query = client.query("SELECT * FROM biographies WHERE owner = '"+req.params.owner+"'", function(error, result){

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

    console.log('updating bio for ', req.body.owner);

    var cols = [];
    var vals_arr = [];
    var vals = '';

    for(var prop in req.body){
        if(prop !== 'getOwner'){
            cols.push(prop);
            vals_arr.push("'" + req.body[prop] + "'");
        }
    }

    vals = vals_arr.join(',');

    pg.connect(connectionString, function(err, client, done){
        var query = client.query("UPDATE biographies SET("+ cols +") = ("+ vals +") WHERE owner = '"+ req.body.owner +"'", function(error, result){
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