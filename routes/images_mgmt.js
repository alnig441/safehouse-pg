var express = require('express');
var router = express.Router();
var pg = require('pg');
var call = require('../public/javascripts/myFunctions.js');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';
var ExifImage = require('exif').ExifImage;
var multer = require('multer');
var crg = require('country-reverse-geocoding').country_reverse_geocoding();

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

    var cols = "created, year, month, day, file, storage";
    var vals = [];
    var created ;

    new ExifImage({ image : './public/buffalo/James/'+ req.body.url }, function (error, exifData) {

        if (req.body.created === undefined) {

            //console.log(exifData);

            if (exifData !== undefined) {

                if (exifData.gps.GPSDateStamp !== undefined) {

                    var date_str = exifData.gps.GPSDateStamp.replace(/:/g, ".");
                    var time_str = exifData.gps.GPSTimeStamp.join(':');
                    created = new Date(date_str + 'Z' + time_str);

                    var lng = exifData.gps.GPSLongitude.slice(0, 2);
                    var lng_str = lng.join('.');
                    var lat = exifData.gps.GPSLatitude.slice(0, 2);
                    var lat_str = lat.join('.');

                    if (exifData.gps.GPSLongitudeRef.toLowerCase() === 'w') {
                        lng_str = '-' + lng_str;
                    }

                    country = crg.get_country(parseInt(lat_str), parseInt(lng_str));
                    cols += ", country";
                    //vals += ", '" + country.name + "'";
                    vals.push("'" + country.name + "'");

                    if (country.code.toLowerCase() !== 'usa') {
                        cols += ", state";
                        //vals += ", 'n/a'";
                        vals.push("'n/a'");
                    }
                }

                else if (exifData.exif.DateTimeOriginal !== undefined) {

                    var dto = exifData.exif.DateTimeOriginal.split(' ');
                    var dto_0 = dto[0].split(':');
                    var timestamp = dto_0.join('-') + ' ' + dto[1];
                    created = new Date(timestamp);

                }

                else if (exifData.image.Software.toLowerCase() === 'apple image capture') {

                    created = new Date();

                }

                else {

                    created = false;
                }

            }

        }

        else {

            created = new Date(req.body.created);

        }

        if (!created) {

            console.log('no valid date present');
            res.status(400).send('no valid date present');
        }

        else {

            vals.unshift("'James'");
            vals.unshift("'" + req.body.url + "'");
            vals.unshift("'" + created.getUTCDate() + "'");
            vals.unshift("'" + created.getUTCMonth() + "'");
            vals.unshift("'" + created.getUTCFullYear() + "'");
            vals.unshift("'" + created.toJSON() + "'");
            vals = vals.toString();


            pg.connect(connectionString, function (err, client, done) {
                var query = client.query("INSERT INTO images(" + cols + ") values(" + vals + ")", function (error, result) {

                    if (error) {
                        console.log(error);
                        res.status(304).send(error);
                    }
                })
                query.on('end', function (result) {
                    res.status(200).send(result.rows);
                })
            })
        }

    });

});

router.put('/upload/:dest?', call.isAuthenticated, function(req, res, next){

    //console.log('in new upload: ', req.params, req.user);

    var currUpload = uploadFnct(req.params.dest);
    currUpload(req,res,function(err){
        if(err){
            res.json({error_code:1,err_desc:err});
            return;
        }
        res.json({error_code:0,err_desc:null, filename: req.file.filename});
    });

});

router.get('/get_one/:id?', call.isAuthenticated, function(req, res, next){

    pg.connect(connectionString, function(error, client, done){
        var query = client.query("SELECT meta, names, country, state, city, occasion, id, path || folder || '/' || file AS url FROM images CROSS JOIN storages where storage = folder AND id=" + parseInt(req.params.id), function(error, result){

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


router.get('/get_new', call.isAuthenticated, function(req, res, next){

    pg.connect(connectionString, function(error, client, done){
    var query = client.query("SELECT *, path || folder || '/' || file as url FROM IMAGES CROSS JOIN STORAGES WHERE FOLDER = STORAGE AND META IS NULL ORDER BY ID DESC", function(err, result){

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

    //console.log('adding meta: ', req.body);

    var body = {};
    var incr = 0;
    var cols = [];
    var vals = '';

    for(var prop in req.body){
        if(prop !== 'file' && prop !== 'created' && prop !== 'id' && prop !== 'url' && req.body[prop] !== null && req.body[prop] !== 'null'){
            body[prop] = req.body[prop];
        }
    }

    if(body.meta !== undefined && typeof body.meta === 'string'){
        body.meta = call.build_obj(call.splitString(req.body.meta));
    }

    if(body.names !== undefined && typeof body.names === 'string'){
        body.names = call.build_obj(call.splitString(req.body.names));
    }

    for(var prop in body){
        incr ++;
        if(typeof body[prop] === 'string' && (prop === 'names' || prop === 'meta')){
            cols.push(prop);
            vals += "array["+ body[prop] + "]";
            if(incr < Object.keys(body).length){
                vals += ",";
            }
        }
        else if(prop !== 'names' && prop !=='meta'){
            cols.push(prop);
            vals += "'" + body[prop] + "'";
            if(incr < Object.keys(body).length){
                vals += ",";
            }
        }
    }

    console.log("Columns: " + cols + "\nValues: "+ vals + "\nReq body length: " + Object.keys(body).length);

    pg.connect(connectionString, function(error, client, done){
        var query = client.query("UPDATE images SET("+ cols +") = ("+ vals +") WHERE id = '"+ req.body.id +"'", function(error, result){

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

    //console.log('in images delete: ', req.body, req.params);

    pg.connect(connectionString, function(error, client, done){
        var query = client.query("DELETE FROM IMAGES * WHERE ID="+ req.params.id, function(err, result){
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

