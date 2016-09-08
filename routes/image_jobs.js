var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';
var bcrypt = require('bcrypt');
var call = require('../public/javascripts/myFunctions.js');
var fs = require('fs');
var crg = require('country-reverse-geocoding').country_reverse_geocoding();
var ExifImage = require('exif').ExifImage;
var qb = require('../public/javascripts/query_builder.js');


router.get('/files', call.isAuthenticated, function(req, res, next){

    console.log('..getting files..');

    fs.readdir('./public/buffalo/James/', function(err, files){

        var newImg = {};
        var total = 0;

        files.forEach(function(elem, ind, array){

            if(elem.charAt(0) != '.') {
                newImg[elem.toLowerCase()] = true;
                total ++;
            }
        });

        pg.connect(connectionString,function(error,client,done){
            var query = client.query('SELECT file FROM images ORDER BY CREATED ASC', function(error, result){
                if(error){
                    res.send(error);
                }
            })
            query.on('row', function(row) {
                if(newImg.hasOwnProperty(row.file.toLowerCase())){
                    newImg[row.file.toLowerCase()] = false;
                }
                total --;
            })
            query.on('end',function(result){
                client.end();

                if(total < 1){
                    newImg = {};
                }

                newImg.total = total;

                res.status(200).send(newImg);
            })
        })
    })

});

router.post('/load', call.isAuthenticated, function(req, res, next){

    //console.log('show me load body: ', req.body, req.params);

    var country;
    var image;

    new ExifImage({ image : './public/buffalo/James/'+ req.body.file }, function (error, exifData) {

        if(exifData) {

            if (exifData.gps.GPSDateStamp) {

                var date_str = exifData.gps.GPSDateStamp.replace(/:/g, ".");
                var time_str = exifData.gps.GPSTimeStamp.join(':');

                var lng = exifData.gps.GPSLongitude.slice(0, 2);
                var lng_str = lng.join('.');
                var lat = exifData.gps.GPSLatitude.slice(0, 2);
                var lat_str = lat.join('.');

                if (exifData.gps.GPSLongitudeRef.toLowerCase() === 'w') {
                    lng_str = '-' + lng_str;
                }

                country = crg.get_country(parseInt(lat_str), parseInt(lng_str));

                req.body.created = date_str + 'Z' + time_str;
                req.body.country = country.name;
            }

            else if (exifData.exif.DateTimeOriginal) {

                var dto = exifData.exif.DateTimeOriginal.split(' ');
                var dto_0 = dto[0].split(':');
                var timestamp = dto_0.join('-') + ' ' + dto[1];

                req.body.created = timestamp;
            }

        }

        req.body = call.buildQBObj(req.body);

        image = new qb(req, 'images');

        pg.connect(connectionString, function(error, client, done){
            var query = client.query(image.insert(), function(error, result){

                if(error){
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
            query.on('end', function(result){
                client.end();
                res.send(result);

            })
        })

    });

});

/* FOR CASES WHERE MORE STORAGES ARE ACTIVE PER USER - NOT IMPLEMENTED YET */

router.get('/count/:active_storage?', call.isAuthenticated, function(req, res, next){

    //console.log('in images count: ', req.params);

    pg.connect(connectionString, function(err, client, done){
        var query = client.query("update storages set size = (select count(*) from images where storage = '"+ req.params.active_storage + "' AND META IS NOT NULL AND NAMES IS NOT NULL AND OCCASION IS NOT NULL AND COUNTRY IS NOT NULL AND STATE IS NOT NULL AND CITY IS NOT NULL) where folder = '"+ req.params.active_storage +"'; select size from storages where folder='"+ req.params.active_storage +"'", function(error, result){
            if(error){
                console.log(error);
            }
            query.on('end', function(result){
                client.end();
                res.status(200).send(result.rows[0]);
            })
        })
    })
})

router.get('/new_files', call.isAuthenticated, function(req, res, next){

    fs.readdir('./public/buffalo/James/', function(err, files) {
        var i = 0;
        files.forEach(function(elem, ind, arr){
            if(elem.charAt(0) === '.'){
                i++;
            }
        })
        res.send({amount: files.length - i});

    });

});

module.exports = router;