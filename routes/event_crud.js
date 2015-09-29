var express = require('express');
var router = express.Router();
var path = require('path');
var Event = require('../models/events');
var Image = require('../models/images');


router.post('/add', function(req, res){
    console.log('in event_crud adding ', req.body.url);
    var image = new Image();
    image.url = req.body.url;
    image.meta = splitString(req.body.meta);
    image.save(function(err){
        if(err){
            console.log(err);
            res.send(err);
        }
    });
    var event = new Event();
    event.event_da = req.body.event_da;
    event.event_en = req.body.event_en;
    event.image_url = req.body.url;
    event.save(function(err){
        if(err){
            console.log(err);
            res.send(err);
        }
    });

    res.send('event posted');

});

function splitString(meta){
    var separator = ' ';
    var temp = meta.split(separator);
    return temp;
};

module.exports = router;