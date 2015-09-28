var express = require('express');
var router = express.Router();
var path = require('path');
var User = require('../models/user');


router.post('/add', function(req, res){
    console.log('in admin_crud adding ', req.body);
    User.findOne({username: req.body.username}, function(err, result){
        if(result === null){
            var user = new User(req.body);
            user.save(function(err){
                if(err)console.log(err);
            });
            console.log('user added');
            var message = 'user "'+ req.body.username + '" added';
            res.send(message);
        } else {
            var message = 'user "' + req.body.username + '" already exists';
            res.send(message);
        }
    });
});

module.exports = router;