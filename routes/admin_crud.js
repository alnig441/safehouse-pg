var express = require('express');
var router = express.Router();
var path = require('path');
var User = require('../models/user');


router.post('/', function(req, res){
    User.findOne({username: req.body.username}, function(err, result){
        if(result === null){
            var user = new User(req.body);
            user.save(function(err){
                if(err)console.log(err);
            });
        }
    });
});

module.exports = router;