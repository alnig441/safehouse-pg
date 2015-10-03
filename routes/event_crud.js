var express = require('express');
var router = express.Router();
var path = require('path');
var Event = require('../models/events');
var Image = require('../models/images');
var fs = require('fs');
var file = path.join(__dirname, '../models/latest.txt');
var multer = require('multer');
var storage  = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './private/images/')
    },
    filename: function(req, file, cb){
        //cb(null, file.fieldname + '-' + Date.now())
        cb(null, file.originalname)
    }
});
var upload = multer({storage: storage});


router.post('/add', function(req, res){
    console.log('in event_crud adding ', req.body);
    var image = new Image();
    image.url = req.body.url;
    image.meta = splitString(req.body.meta);
    image.created = req.body.created;
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
    event.save(function(err, product, numberAffected){
        if(err){
            console.log(err.message);
            res.send('no event created: ' + err.message);
        }

        console.log('printing product ', product._id);

        fs.writeFile(file, product._id, function(err){
        if(err)throw err;
        console.log('saved');
        })
        res.send('event posted');

    });

});

router.post('/upload', upload.single('file'), function(req, res, next){
    //console.log('upload',req.file);
    res.status(200);
});

router.get('/view', function(req, res){
    console.log('in event get');
    var ID = {};
    fs.readFile(file, 'utf8', function (err, data) {
        if(err){
            next(err)
        }
        else{
            ID._id = data;
            console.log('id of latest event ', ID);
            Event.findOne(ID, function(err, result){
                if(err){
                    console.log(err);
                }
                else{
                    console.log(result);
                    res.send(result);
                }
            })

        }
    })

});

//splittig meta data string from form into an array of meta data
function splitString(meta){
    var separator = ' ';
    var temp = meta.split(separator);
    return temp;
};

module.exports = router;