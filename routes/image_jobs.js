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

        files.forEach(function(elem, ind, array){

            array[ind] = elem.toLowerCase();
            var x = array[ind].split('_');
            var y = array[ind].split('-');

/*
            if(elem.length < 23){
                array[ind] = 'zzz';
            }
            else if(isNaN(y[0]) && x[0] !== 'img'){
                array[ind] = 'zzz';
            }
*/
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
                        if(elem.file.toLowerCase() === files[i].toLowerCase()){
                            files[i] = 'zzz';
                        }
                    }
                })
                files.sort();
                files = files.slice(0,5);
                res.send(files.slice(0,5));
            })
        })
    })

});

router.post('/load', call.isAuthenticated, function(req, res, next){

    console.log('in images: ', req.body.file);
    var created;
    var country;
    var cols = "created, year, month, day, file, storage";
    var vals = [];

    new ExifImage({ image : './public/buffalo/James/'+ req.body.file }, function (error, exifData) {

        if(req.body.file !== 'zzz' && exifData !== undefined){

            console.log('this is the exifdata: ', exifData);

            if(exifData.gps.GPSDateStamp !== undefined){

                var date_str = exifData.gps.GPSDateStamp.replace(/:/g, ".");
                var time_str = exifData.gps.GPSTimeStamp.join(':');
                created = new Date(date_str + 'Z' + time_str);

                var lng = exifData.gps.GPSLongitude.slice(0,2);
                var lng_str = lng.join('.');
                var lat = exifData.gps.GPSLatitude.slice(0,2);
                var lat_str = lat.join('.');

                if(exifData.gps.GPSLongitudeRef.toLowerCase() === 'w'){
                    lng_str = '-'+lng_str;
                }

                country = crg.get_country(parseInt(lat_str), parseInt(lng_str));
                cols += ", country";
                vals.push("'"+country.name+"'");

                if(country.code.toLowerCase() !== 'usa'){
                    cols += ", state";
                    vals.push("'n/a'");
                }
            }

            else if(exifData.exif.DateTimeOriginal !== undefined){

                var dto = exifData.exif.DateTimeOriginal.split(' ');
                var dto_0 = dto[0].split(':');
                var timestamp = dto_0.join('-') + ' ' + dto[1];
                created = new Date(timestamp);

            }

            console.log('TIME CREATED \nLocal: '+ created + '\nZulu: ' + created.toJSON());

            vals.unshift("'James'");
            vals.unshift("'"+req.body.file+"'");
            vals.unshift("'"+created.getUTCDate()+"'");
            vals.unshift("'"+created.getUTCMonth()+"'");
            vals.unshift("'"+created.getUTCFullYear()+"'");
            vals.unshift("'"+created.toJSON()+"'");
            vals = vals.toString();

            console.log('Sending query: \nColumns: '+ cols + '\nValues: '+vals);


            pg.connect(connectionString, function(error, client, done){
                var query = client.query("INSERT INTO images("+cols+") values("+vals+")", function(error, result){

                    if(error){
                        console.log(error);
                        res.status(200).send(error);
                    }
                })
                query.on('end', function(result){
                    client.end();
                    res.send(result);

                })
            })

        }

        else{
            res.status(200).send('File not entered: '+ req.body.file);
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