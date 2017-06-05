var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var call = require('../public/javascripts/myFunctions.js');
var fs = require('fs');

router.get('/videos', call.isAuthenticated, function(req, res, next){

    fs.readdir('./public/buffalo/Videos/', function(err, files){
        res.status(200).send(files);
    })

});

module.exports = router;