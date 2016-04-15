var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';


router.post('/dropdown', function(req, res, next){

    console.log('..building dropdwon..', req.body);

    var months = [
        {value: 1, da: 'Februar', en:'February'},
        {value: 2, da: 'Marts', en: 'March'},
        {value: 3, da: 'April', en:'April'},
        {value: 4, da: 'Maj', en:'May'},
        {value: 5, da: 'Juni', en:'June'},
        {value: 6, da: 'Juli', en:'July'},
        {value: 7, da: 'August', en:'August'},
        {value: 8, da: 'September', en:'September'},
        {value: 9, da: 'Oktober', en:'October'},
        {value: 10, da: 'November', en:'November'},
        {value: 11, da: 'December', en:'December'}
    ];

    var option = req.body.option;
    var db = req.body.database;
    var array = [];
    var mySet = new Set();

    var query_string;
    db === 'events' ? query_string = 'SELECT images.created FROM images cross join events where images.id = events.img_id ORDER BY CREATED DESC' : query_string = 'SELECT created FROM images ORDER BY CREATED DESC' ;

    console.log(query_string);

});

module.exports = router;