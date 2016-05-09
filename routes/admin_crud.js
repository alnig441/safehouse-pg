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

router.get('/images/files', call.isAuthenticated, function(req, res, next){

    console.log('..getting files..');

    fs.readdir('./public/buffalo/James/', function(err, files){

        console.log('original files: ', files.slice(0,5));

        files.forEach(function(elem, ind, array){

            array[ind] = elem.toLowerCase();
            var x = array[ind].split('_');
            var y = array[ind].split('-');

            if(elem.length < 23){
                array[ind] = 'zzz';
            }
            else if(isNaN(y[0]) && x[0] !== 'img'){
                array[ind] = 'zzz';
            }
        });
        files.sort();


        pg.connect(connectionString,function(error,client,done){
            var query = client.query('SELECT file FROM images ORDER BY CREATED ASC', function(error, result){
                if(error){
                    console.log(error);
                }
            })
            query.on('end',function(result){
                client.end();

                result.rows.forEach(function(elem,ind,arr){
                    for(var i = 0 ; i < files.length ; i ++){
                        //if(elem.file.slice(-23).toLowerCase() === files[i].toLowerCase()){
                        if(elem.file.toLowerCase() === files[i].toLowerCase()){
                            files[i] = 'zzz';
                        }
                    }
                })
                files.sort();
                files = files.slice(0,5);
                console.log('sending files: ',files);
                res.send(files.slice(0,5));
            })
        })
    })

});

router.post('/images', call.isAuthenticated, function(req, res, next){

    console.log('in images: ', req.body.file);

    req.body.file = req.body.file.toLowerCase();

    //var url = './buffalo/James/';
    //var url = url + req.body.file;
    var arr = req.body.file.split('_');
    var arr2 = req.body.file.split('-');
    var created;

    if(arr[0] !== 'img' && isNaN(arr2[0])){
        res.status(400).send('bad file');
        console.log('bad file', req.body.file);
    }
    else{

        created = call.setDate(req.body.file);

        pg.connect(connectionString, function(error, client, done){
            var query = client.query("INSERT INTO images(file, created, year, month, day, storage) values($1, $2, $3, $4, $5, 'James')", [req.body.file, created, created.getUTCFullYear(), created.getUTCMonth(), created.getUTCDate()],function(error, result){
                if(error){
                    console.log(error);
                }
            })
            query.on('end', function(result){
                client.end();
                res.send(result);

            })
        })

    }

});

router.get('/images/count', call.isAuthenticated, function(req, res, next){

    pg.connect(connectionString, function(err, client, done){
        var query = client.query("update storages set size = (select count(*) from images) where folder = 'James'; select size from storages where folder='James'", function(error, result){
            if(error){
                console.log(error);
            }
            query.on('end', function(result){
                client.end();
                res.status(200).send(result.rows[0]);
            })
        })
    })
})

router.get('/images/new_files', call.isAuthenticated, function(req, res, next){

    fs.readdir('./public/buffalo/James/', function(err, files) {
        var i = 0;
        files.forEach(function(elem, ind, arr){
            if(elem.charAt(0) === '.' && elem.charAt(0).toLowerCase() !== 'i' && parseInt(elem.charAt(0)) !== 2){
                i++;
            }
        })
        res.send({amount: files.length - i});

    });

});

// FOR UPDATE TOOL

//
//router.put('/date', call.isAuthenticated, function(req, res, next){
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
//router.post('/update', call.isAuthenticated, function(req, res, next){
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