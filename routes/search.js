var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';


router.post('/dropdown', function(req, res, next){

    console.log('..building dropdwon..', req.body);

    var option = req.body.option;
    var db = req.body.database;
    var array = [];
    //var mySet = new Set();

    var query_string;
    db === 'events' ? query_string = 'SELECT images.created FROM images cross join events where images.id = events.img_id ORDER BY CREATED DESC' : query_string = 'SELECT created FROM images ORDER BY CREATED DESC' ;

    console.log(query_string);

});

module.exports = router;