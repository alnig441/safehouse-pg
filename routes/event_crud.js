var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';
var ExifImage = require('exif').ExifImage;
var multer = require('multer');

var uploadFnct = function(dest){
    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './public/buffalo/'+dest+'/');
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    });

    var upload = multer({ //multer settings
        storage: storage
    }).single('file');

    return upload;
};

router.post('/add_img', call.isAuthenticated, function(req, res) {

    console.log('/add_img: ', req.body);
    var cols = "created, year, month, day, file, storage, latitude, longitude";
    var vals = "$1, $2, $3, $4, $5, 'James', $6, $7";

    new ExifImage({ image : './public/buffalo/James/'+ req.body.url }, function (error, exifData) {
            if (exifData === undefined){
                req.body.created === undefined ? req.body.created = new Date(): req.body.created = new Date(req.body.created);
            }
            else{
                console.log('all exif: ', exifData);
                var dto = exifData.exif.DateTimeOriginal;
                var make = exifData.image.Make.toLowerCase();

                if(exifData.gps !== undefined){
                    req.body.latitude = exifData.gps.GPSLatitude;
                    req.body.longitude = exifData.gps.GPSLongitude;
                } else{
                    req.body.latitude = null;
                    req.body.longitude = null;
                }

                if(dto !== undefined){
                    var arr = dto.split(' ');
                    var arr1 = arr[0].split(':');
                    var tempStr = arr1.join('-') + ' ' + arr[1];
                    req.body.created = new Date(tempStr);
                }
                else if(exifData.image !== undefined && (make === 'motorola' || make === 'apple')){
                    req.body.created = call.setDate(req.body.url);
                }
            }

            pg.connect(connectionString, function (err, client, done) {
                var query = client.query("INSERT INTO images("+cols+") values("+vals+")",[req.body.created, req.body.created.getUTCFullYear(), req.body.created.getUTCMonth(), req.body.created.getUTCDate(), req.body.url, req.body.latitude, req.body.longitude] , function (error, result) {

                    if (error) {
                        console.log(error);
                        res.status(304).send(error);
                    }
                })
                query.on('end', function (result) {
                    res.status(200).send(result.rows);
                })
            })

        });

});

router.post('/add_event', call.isAuthenticated, function(req, res, next){

    pg.connect(connectionString, function (err, client, done) {

        var query = client.query("INSERT INTO events (event_da, event_en, img_id, updated) values($1, $2, $3, $4)", [req.body.event_da, req.body.event_en, req.body.img_id, req.body.updated], function (error, result) {
            if (error) {
                console.log('there was an error ', error);
                res.status(200).send(error.error);
            }
        })
        query.on('end', function (result) {
            client.end();
            res.status(200).send(result);
        })
    })

});

router.put('/upload/:dest?', call.isAuthenticated, function(req, res, next){

    console.log('in new upload: ', req.params);

    var currUpload = uploadFnct(req.params.dest);
    currUpload(req,res,function(err){
        if(err){
            res.json({error_code:1,err_desc:err});
            return;
        }
        res.json({error_code:0,err_desc:null, filename: req.file.filename});
    });

});

router.get('/img', call.isAuthenticated, function(req, res, next){

    pg.connect(connectionString, function(error, client, done){
        var query = client.query("SELECT *, path || folder || '/' || file AS url FROM images CROSS JOIN storages WHERE storage = folder AND id = (SELECT max(id) FROM images)", function(error, result){
                if(error){
                console.log(error);
            }
        })
        query.on('end', function(result){
            client.end();
            res.status(200).send(result.rows);
        })
    })
});

router.get('/get_one/:img_id?', call.isAuthenticated, function(req, res, next){

    console.log('getting event by img_id: ', req.params);

    pg.connect(connectionString, function(error, client, done){
        var query = client.query('SELECT * FROM events WHERE img_id=' + parseInt(req.params.img_id), function(error, result){

           if(error){
               console.log(error);
           }
        });
        query.on('end', function(result){
            client.end();
            res.status(200).send(result.rows);
        })
    })
});

router.get('/img_get_one/:id?', call.isAuthenticated, function(req, res, next){

    pg.connect(connectionString, function(error, client, done){
        var query = client.query("SELECT *, path || folder || '/' || file AS url FROM images CROSS JOIN storages where storage = folder AND id=" + parseInt(req.params.id), function(error, result){

                if(error){
                console.log(error);
            }
        });
        query.on('end', function(result){
            client.end();
            res.status(200).send(result.rows);
        })

    })
});

router.get('/img_all', call.isAuthenticated, function(req, res, next){

    pg.connect(connectionString, function(error, client, done){
        var query = client.query('SELECT * FROM images order by id asc', function(error, result){

                if(error){
                console.log(error);
                res.status(200).send(error);
            }
        })
        query.on('end', function(result){
            client.end();
            res.status(200).send(result.rows);
        })
    })
});

router.put('/', call.isAuthenticated, function(req, res, next){

    pg.connect(connectionString, function(error, client, done){
        var query = client.query('UPDATE events SET (event_da, event_en) =($1, $2) WHERE img_id= $3 ', [req.body.event_da, req.body.event_en, req.body.img_id], function(error, result){
            if(error){
                console.log(error);
                res.status(200).send(error);
            }
        })
        query.on('end', function(result){
            client.end();
            res.status(200).send(result.rows);
        })
    })

});

router.put('/img_meta', call.isAuthenticated, function(req, res, next){

    var array = call.splitString(req.body.meta);

    pg.connect(connectionString, function(error, client, done){
        var query = client.query('UPDATE images SET meta = $1 WHERE id = $2', [array, req.body.id], function(error, result){
            if(error){
                console.log(error);
                res.status(200).send(error);
            }
        })
        query.on('end', function(result){
            client.end();
            res.status(200).send(result.rows);
        })
    })
});

module.exports = router;

