var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';
var ExifImage = require('exif').ExifImage;
var multer = require('multer');
var crg = require('country-reverse-geocoding').country_reverse_geocoding();
var qb = require('../public/javascripts/query_builder.js');

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

router.post('/add', call.isAuthenticated, function(req, res) {

    req.body = call.buildQBObj(req.body);

    console.log('hvad kommer ind: ', req.body);

    var img = new qb(req, 'images');

    pg.connect(connectionString, function (err, client, done) {
        var query = client.query(img.insert(), function (error, result) {

            if (error) {
                switch (error.code){

                    case '22007':
                        error.detail = 'Created: Invalid Date';
                        break;
                    case '22001':
                        error.detail = 'File name too long';
                        break;
                    default:
                        error.detail = 'postgres error code: ' + error.code;
                        break;
                }
                res.send(error);
            }
        })
        query.on('end', function (result) {
            client.end();
            res.status(200).send(result.rows);
        })
    })


});


router.put('/upload/:dest?', call.isAuthenticated, function(req, res, next){

    var currUpload = uploadFnct(req.params.dest);

    currUpload(req,res,function(err){

        console.log('show me response from upload', err);

        if(err){
            res.json({error_code:1,err_desc:err});
            return;
        }
        res.json({error_code:0,err_desc:null, filename: req.file.filename});
    });

});

router.post('/batch', call.isAuthenticated, function(req,res,next){

    console.log('show me body: ', req.body, typeof req.body.id);

    var batch = new qb(req, 'images', 'id', ['names', 'meta']);

    pg.connect(connectionString, function(error, client, done){

        var query = client.query(batch.update(), function(error, result){
            if(error){
                console.log(error);
            }
        });
        query.on('end', function(result){
            client.end();
            res.status(200).send(result);
        })
    })


});

router.get('/get_one/:id?', call.isAuthenticated, function(req, res, next){

    pg.connect(connectionString, function(error, client, done){
        var query = client.query("SELECT i.*, path || folder || '/' || file AS url FROM images AS i CROSS JOIN storages where storage = folder AND id=" + parseInt(req.params.id), function(error, result){

                if(error){
                console.log(error);
            }
        });
        query.on('row', function(row){
            res.status(200).send(row);
        })
        query.on('end', function(result){
            client.end();
        })

    })
});

router.get('/get_all', call.isAuthenticated, function(req, res, next){

    //var images = new qb(req, 'images');

    pg.connect(connectionString, function(error, client, done){
        var query = client.query('select * from images where occasion is not null order by id desc', function(error, result){
        //var query = client.query(images.select({id: 'DESC'}), function(error, result){

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


router.get('/get_new', call.isAuthenticated, function(req, res, next){

    pg.connect(connectionString, function(error, client, done){
    var query = client.query("SELECT i.*, path || folder || '/' || file as url FROM IMAGES AS i CROSS JOIN STORAGES WHERE FOLDER = STORAGE AND META IS NULL ORDER BY ID DESC", function(err, result){

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
})

router.put('/add_meta', call.isAuthenticated, function(req, res, next){

    console.log('adding meta: ', req.body);

    var image = new qb(req, 'images', 'id', ['names', 'meta']);

    //console.log(image.update());

    pg.connect(connectionString, function(error, client, done){
        var query = client.query(image.update(), function(error, result){

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

router.delete('/:id?', call.isAuthenticated, function(req, res, next){

    console.log('deleting: ', req.params, req.body);

    var image = new qb(req, 'images');

    pg.connect(connectionString, function(error, client, done){
        var query = client.query(image.delete(), function(err, result){
            if(err){
                res.status(200).send(err);
            }
        })
        query.on('end', function(result){
            client.end();
            res.status(200).send(result);
        }
        )
    })
});



module.exports = router;

