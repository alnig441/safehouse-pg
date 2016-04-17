var express = require('express');
var router = express.Router();
var passport = require('passport');
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';
var bcrypt = require('bcrypt');
var call = require('../public/javascripts/myFunctions.js');
var fs = require('fs');

//Add account
router.post('/add', call.isAuthenticated, function(req, res){

    console.log('admin crud add: ', req.body);

    pg.connect(connectionString, function(err, client, done){
        if(err){console.log(err);}
        var hash = bcrypt.hashSync(req.body.password, 12);

        var query = client.query("INSERT INTO users(username, password, acct_type, lang) values($1, $2, $3, $4)", [req.body.username.toLowerCase(), hash, req.body.acct_type, req.body.lang], function(error, result){
            if(error){console.log(error.detail);}
        });

        query.on('end', function(result){
            client.end();
            res.send('user ' + req.body.username + ' created');

        });
    })
});

//View account
router.get('/:acct_type?', call.isAuthenticated, function(req, res){

    console.log('admin_crud: ', req.params);

    pg.connect(connectionString, function(err, client, done){

        var user = [];
        var query = client.query("SELECT * FROM users WHERE acct_type='" + req.params.acct_type + "'", function(error, result){
            if(error){console.log('there was an error ', error.detail);}
        })

        query.on('row', function(row, result){
            user.push(row);
        })

        query.on('end',function(result){
            client.end();
            console.log(user);
            res.send(user);
        })

        //res.send(user);
    })

});

//Delete account
router.delete('/:username?', call.isAuthenticated, function(req, res){

    pg.connect(connectionString, function(err, client, done){
        if(err){console.log(err);}

        var query = client.query("DELETE FROM users WHERE username='" + req.params.username + "'", function(error, result){
            if(error){console.log('there was an error ', error.detail);}
        })

        query.on('end', function(result){
            client.end();
            res.send('user '+ req.params.username + ' deleted');
        })
    })

});


//Change password
router.put('/chg', call.isAuthenticated, function(req, res){

    console.log('..changing pw.. :', req.body);

    var hash = bcrypt.hashSync(req.body.new_password, 12);

    pg.connect(connectionString, function(err, client, done){

        var query = client.query("UPDATE users SET password='" + hash + "' WHERE username='" + req.body.username.toLowerCase() + "'", function(error, result){
            if(error){console.log('there was an error ', error.detail);}
        });

        query.on('end', function(result){
            client.end();
            res.send('password changed for user ' + req.body.username);
        })
    })

});

router.get('/images/files', function(req, res, next){

    console.log('..getting files..');

    fs.readdir('./public/buffalo/2015/', function(err, files){
        if(err){
            console.log(err);
        }
        else{
            console.log(files);
        }
        res.send(files);
    })

});

router.post('/images', function(req, res, next){

    console.log('in images: ', req.body.file);

    req.body.file = req.body.file.toLowerCase();
    var url = './buffalo/2015/';
    var url = url + req.body.file;
    var created;
    var year;
    var month;
    var day;

    if(req.body.file.charAt(0)=='i' && req.body.file.charAt(1)=='m' && req.body.file.charAt(2)=='g' && req.body.file.length >= 23 ){
        console.log('YES INDEED');
        created = call.setDate(req.body.file);
        year = created.getUTCFullYear();
        month = created.getUTCMonth();
        day = created.getUTCDate();
    }

    else{
        res.send('bad file');
    }
    console.log('..batch posting...', created);

    pg.connect(connectionString, function(error, client, done){
        var query = client.query("INSERT INTO images(url, created, year, month, day) values($1, $2, $3, $4, $5)", [url, created, year, month, day],function(error, result){
            if(error){
                console.log(error);
            }
        })
        query.on('end', function(result){
            client.end();

        })
    })
});

// FOR UPDATE TOOL

//
//router.put('/date', function(req, res, next){
//
//
//    pg.connect(connectionString, function(err, client, done){
//        var query = client.query('select id, created from images', function(error, result){
//            if(error){
//                console.log(error);
//            }
//        })
//        query.on('end',function(result){
//            client.end();
//            res.send({images: result.rows});
//        })
//    })
//});
//
//router.post('/update', function(req, res, next){
//
//    var date = new Date(req.body.created);
//
//    pg.connect(connectionString, function(error, client, result){
//        var query = client.query('update images set (year, month, day) = ($1, $2, $3) where id=$4',[date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), req.body.id], function(err, client, done){
//            if(error){
//                console.log(error);
//            }
//        })
//        query.on('row', function(row){
//            console.log('BAAAH: ', row);
//        })
//        query.on('end',function(result){
//            client.end();
//            res.send('forsatanda');
//        })
//    })
//
//});
//
module.exports = router;