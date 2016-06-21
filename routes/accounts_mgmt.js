var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';
var bcrypt = require('bcrypt');
var call = require('../public/javascripts/myFunctions.js');


router.post('/add', call.isAuthenticated, function(req, res){

    console.log('admin crud add: ', req.body);

    pg.connect(connectionString, function(err, client, done){
        if(err){console.log(err);}
        var hash = bcrypt.hashSync(req.body.password, 12);

        var query = client.query("INSERT INTO users(username, password, acct_type, lang, storages) values($1, $2, $3, $4, '{"+req.body.storage.folder+"}')", [req.body.username.toLowerCase(), hash, req.body.acct_type, req.body.lang], function(error, result){
            if(error){
                console.log('show me the error: ', error);
                res.status(200).send(error);
            }
        });

        query.on('end', function(result){
            client.end();
            res.send('user ' + req.body.username + ' created');

        });
    })
});

router.get('/:acct_type?', call.isAuthenticated, function(req, res){

    console.log('admin_crud: ', req.params);

    pg.connect(connectionString, function(err, client, done){

        var user = [];
        var query = client.query("SELECT username, acct_type, lang, storages  FROM users WHERE acct_type='" + req.params.acct_type + "'", function(error, result){
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

router.put('/modify_storage', function(req, res, next){

    console.log('storage add/remove: ', req.body);

    var folder;
    req.body.option === 'array_append' ? folder = req.body.storage_new.folder: folder = req.body.storage;

    pg.connect(connectionString,function(err,client,done){
        var query=client.query("UPDATE users SET storages ="+ req.body.option +"(storages, '"+ folder +"') WHERE username='" + req.body.username + "'", function(error, result){
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