var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';
var bcrypt = require('bcrypt');
var call = require('../public/javascripts/myFunctions.js');
var fs = require('fs');
var crg = require('country-reverse-geocoding').country_reverse_geocoding();
var ExifImage = require('exif').ExifImage;

router.get('/files', call.isAuthenticated, function(req, res, next){

    console.log('..getting files..');

    fs.readdir('./public/buffalo/James/', function(err, files){

        console.log('original files: ', files.slice(0,5));

        files.forEach(function(elem, ind, array){

            array[ind] = elem.toLowerCase();
            var x = array[ind].split('_');
            var y = array[ind].split('-');

            if(elem.length < 23){
                array[ind] = 'zzz';
            }
            else if(isNaN(y[0]) && x[0] !== 'img'){
                array[ind] = 'zzz';
            }
        });
        files.sort();


        pg.connect(connectionString,function(error,client,done){
            var query = client.query('SELECT file FROM images ORDER BY CREATED ASC', function(error, result){
                if(error){
                    console.log(error);
                }
            })
            query.on('end',function(result){
                client.end();

                result.rows.forEach(function(elem,ind,arr){
                    for(var i = 0 ; i < files.length ; i ++){
                        //if(elem.file.slice(-23).toLowerCase() === files[i].toLowerCase()){
                        if(elem.file.toLowerCase() === files[i].toLowerCase()){
                            files[i] = 'zzz';
                        }
                    }
                })
                files.sort();
                files = files.slice(0,5);
                console.log('sending files: ',files);
                res.send(files.slice(0,5));
            })
        })
    })

});

router.post('/load', call.isAuthenticated, function(req, res, next){

    console.log('in images: ', req.body.file);
    var arr = req.body.file.split('_');
    var arr2 = req.body.file.split('-');
    var created;
    var country;
    var cols = "file, created, year, month, day, storage";
    var vals;

    new ExifImage({ image : './public/buffalo/James/'+ req.body.file }, function (error, exifData) {

        if(req.body.file !== 'zzz'){

            if (exifData === undefined){
                if(arr[0] !== 'img' && isNaN(arr2[0])){
                    res.status(400).send('bad file');
                }
                else {
                    created = call.setDate(req.body.file);
                    vals = "'"+ req.body.file + "', '"+ created.toJSON() + "', '"+ created.getUTCFullYear() + "', '"+ created.getUTCMonth() +"', '"+ created.getUTCDate() +"', 'James'";
                }
            }
            else if(exifData.exif.DateTimeOriginal === undefined){
                created = call.setDate(req.body.file);
                vals = "'"+ req.body.file + "', '"+ created.toJSON() + "', '"+ created.getUTCFullYear() + "', '"+ created.getUTCMonth() +"', '"+ created.getUTCDate() +"', 'James'";
            }
            else{
                console.log('show me exifdata: ', exifData);
                var dto = exifData.exif.DateTimeOriginal.split(' ');
                var dto_0 = dto[0].split(':');
                var timestamp = dto_0.join('-') + ' ' + dto[1];
                created = new Date(timestamp);
                vals = "'"+ req.body.file + "', '"+ timestamp + "', '"+ created.getUTCFullYear() + "', '"+ created.getUTCMonth() +"', '"+ created.getUTCDate() +"', 'James'";

                if(exifData.gps.GPSLongitude !== undefined){
                    var lng = exifData.gps.GPSLongitude.slice(0,2);
                    var lng_str = lng.join('.');
                    var lat = exifData.gps.GPSLatitude.slice(0,2);
                    var lat_str = lat.join('.');
                    if(exifData.gps.GPSLongitudeRef.toLowerCase() === 'w'){
                        lng_str = '-'+lng_str;
                    }
                    country = crg.get_country(parseInt(lat_str), parseInt(lng_str));
                    cols += ", country";
                    vals += ", '" + country.name + "'";
                    if(country.code.toLowerCase() !== 'usa'){
                        cols += ", state";
                        vals += ", 'n/a'";
                    }

                }

            }

            console.log('COLS: '+ cols + '\nVALS: '+vals+ '\nTimestamp: '+ timestamp);

            pg.connect(connectionString, function(error, client, done){
                var query = client.query("INSERT INTO images("+cols+") values("+vals+")", function(error, result){

                    if(error){
                        console.log(error);
                    }
                })
                query.on('end', function(result){
                    client.end();
                    res.send(result);

                })
            })

        }

        else{
            res.status(200).send('end of new files');
        }

    });

});

/* FOR CASES WHERE MORE STORAGES ARE ACTIVE PER USER - NOT IMPLEMENTED YET */

router.get('/count/:active_storage?', call.isAuthenticated, function(req, res, next){

    console.log('in images count: ', req.params);

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