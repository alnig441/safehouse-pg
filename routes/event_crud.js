var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';
var multer = require('multer');

/*
var storage  = multer.diskStorage({
    destination: function(req, file, cb){
        console.log('in storage obj: ', file, req.user);
        //cb(null, './public/buffalo/' + call.setDate(file.originalname).getFullYear() + '/')
        cb(null, './public/buffalo/James/')
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
});
var upload = multer({storage: storage});
*/


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

    console.log('adding image: ', req.body);

    if (req.body.created == null) {
        req.body.created = call.setDate(req.body.url);
    }

    console.log('jim-bob', Date.parse(req.body.created));
    //POSTGRES REFACTOR SAVE IMAGE
    pg.connect(connectionString, function (err, client, done) {
        var query = client.query("INSERT INTO images(created, year, month, day, file, storage) values($1, $2, $3, $4, $5, 'James')",[req.body.created, req.body.created.getUTCFullYear(), req.body.created.getUTCMonth(), req.body.created.getUTCDate(), req.body.url] , function (error, result) {

                if (error) {
                console.log(error);
                res.status(304).send(error);
            }
        })
        query.on('end', function (result) {
            res.status(200).send(result.rows);
        })
    })

})

router.post('/add_event', function(req, res, next){

    console.log('..adding event.. :', req.body);

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
/*

router.post('/upload', call.isAuthenticated, upload.single('file'), function(req, res, next){

    console.log('in upload: ', req.file, req.body);

    res.status(200);
});
*/

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

router.get('/img', function(req, res, next){

    pg.connect(connectionString, function(error, client, done){
        var query = client.query("SELECT *, path || folder || '/' || file AS url FROM images CROSS JOIN storages WHERE storage = folder AND id = (SELECT max(id) FROM images)", function(error, result){
                if(error){
                console.log(error);
            }
        })
        query.on('end', function(result){
            console.log('min bare roev:', result.rows);
            client.end();
            res.status(200).send(result.rows);
        })
    })
});

router.get('/get_one/:img_id?', function(req, res, next){

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

router.get('/img_get_one/:id?', function(req, res, next){

    pg.connect(connectionString, function(error, client, done){
        var query = client.query("SELECT *, path || folder || '/' || file AS url FROM images CROSS JOIN storages where storage = folder AND id=" + parseInt(req.params.id), function(error, result){

                if(error){
                console.log(error);
            }
        });
        query.on('end', function(result){
            console.log('en enkelt begivenhed', result.rows);
            client.end();
            res.status(200).send(result.rows);
        })

    })
});

router.get('/img_all', function(req, res, next){

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

router.put('/', function(req, res, next){

    console.log('..updating event ... ', req.body);

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

router.put('/img_meta', function(req, res, next){

    console.log('...updating img meta ..', req.body);

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

//router.put('/img_url', function(req, res, next){
//
//    console.log('img_url: ', req.body.name, req.body.id);
//
//    pg.connect(connectionString, function(error, client, done){
//        var query = client.query('UPDATE images SET file_name = $1 WHERE id = $2', [req.body.name, req.body.id], function(error, result){
//            if(error){
//                console.log(error);
//                res.status(200).send(error);
//            }
//        })
//        query.on('end', function(result){
//            client.end();
//            res.status(200).send(result);
//        })
//    })
//});

module.exports = router;

