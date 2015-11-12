var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';
var bcrypt = require('bcrypt');

//Add account
router.post('/add', function(req, res){
    console.log('in admin_crud adding ', req.body);

    //POSTGRES REFACTOR
    pg.connect(connectionString, function(err, client, done){
        console.log(req.body.username);

        var hash = bcrypt.hashSync(req.body.password, 12);

        var query = client.query("INSERT INTO users(username, password, acct_type, lang) values($1, $2, $3, $4)", [req.body.username, hash, req.body.acct_type, req.body.lang], function(error, result){
            if(error){console.log(error.detail);}
        });

        query.on('row', function(row){
            user = row;
            console.log(row);
            //results.push(row);
        });

        query.on('end', function(result){
            client.end();
            console.log('query.on end: ', result.fields);
            console.log('user created');
            return;

        });
    })
    //POSTGRES REFACTOR
});

//View account
router.get('/:acct_type?', function(req, res){
    console.log('in admin_crud getting acct data', req.params.acct_type);

    pg.connect(connectionString, function(err, client, done){

        var user = [];
        var query = client.query("SELECT * FROM users", function(error, result){
            if(error){console.log('there was an error ', error.detail);}
            else {console.log('this is the query result: ', result);}
        })

        query.on('row', function(row, result){
            user.push(row);
        })

        query.on('end',function(result){
            console.log(user);
            res.send(user);
        })

        //res.send(user);
    })

});

//Delete account
router.delete('/:username?', function(req, res){
    console.log('in admin_crud deleting acct id ', req.params.username);

    pg.connect(connectionString, function(err, client, done){

        var query = client.query("DELETE FROM users WHERE username='" + req.params.username + "'", function(error, result){
            if(error){console.log('there was an error ', error.detail);}
            else{console.log('this is the query result: ', result);}
        })

        query.on('row', function(row){
            console.log('user found: ', row);
        })

        query.on('end', function(result){
            console.log('user '+ req.params.username + ' deleted');
        })
    })

});


//Change password
router.put('/chg', function(req, res){
    console.log('in admin_crud updating ', req.body);

    var hash = bcrypt.hashSync(req.body.password, 12);
    console.log('new password ', hash);

    pg.connect(connectionString, function(err, client, done){

        var query = client.query("UPDATE users SET password='" + hash + "' WHERE username='" + req.body.username + "'", function(error, result){
            if(error){console.log('there was an error ', error.detail);}
            else{console.log('printing the result ', result);}
        });

        query.on('row', function(row){
            console.log(row);
        })

        query.on('end', function(result){
            console.log('password changed for user ', req.body.username);
        })
    })

    User.findOne({username: req.body.username}, function(err, result){
            console.log('printing result: ', result);
            var user = result;
            user.password = req.body.new_password;
            console.log(user);
            user.save(function(err){
                if(err)console.log(err);
            });
            var message = 'pw for acct "' + req.body.username + '" has been changed';
            res.send(message);
    });
});


module.exports = router;