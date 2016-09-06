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

        var newImg = {};
        newImg.total = 0;

        files.forEach(function(elem, ind, array){

            if(elem.charAt(0) != '.') {
                newImg[elem] = true;
                newImg.total ++;
            }
        });

        pg.connect(connectionString,function(error,client,done){
            var query = client.query('SELECT file FROM images ORDER BY CREATED ASC', function(error, result){
                if(error){
                    res.send(error);
                }
            })
            query.on('row', function(row) {
                if(newImg.hasOwnProperty(row.file)){
                    newImg[row.file] = false;
                    newImg.total --;
                }
            })
            query.on('end',function(result){
                client.end();

                res.send(newImg);
            })
        })
    })

});

router.post('/load', call.isAuthenticated, function(req, res, next){

    console.log('show me load body: ', req.body, req.params);

    var created;
    var country;
    var cols = "created, year, month, day, file, storage";
    var vals = [];

    new ExifImage({ image : './public/buffalo/James/'+ req.body.file }, function (error, exifData) {

        if(req.body.file !== 'zzz' && exifData !== undefined){

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

                if(country.code.toLowerCase() !== 'usa' && country.code.toLowerCase() !== 'united states of america'){
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

            else {

                var file = req.body.file;
                var tmp;
                var year;
                var month;
                var day;
                var hour;
                var minute;
                var second;

                if(Array.isArray(file.split(' ')[0].split('-')) && file.split(' ')[0].split('-').length == 3){
                    tmp = file.split(' ')[0].split('-');
                    year = tmp[0];
                    month = tmp[1] - 1;
                    day = tmp[2];
                    tmp = file.split(' ')[1].split('.');
                    hour = tmp[0];
                    minute = tmp[1];
                    second = tmp[2];

                }
                else if(file.split('_')[1].length == 8 && file.split('_')[2].length >= 6){
                    tmp = file.split('_')[1];
                    year = tmp.slice(0,4);
                    month = tmp.slice(4,6) - 1;
                    day = tmp.slice(6,8);
                    tmp = file.split('_')[2];
                    hour = tmp.slice(0,2);
                    minute = tmp.slice(2,4);
                    second = tmp.slice(4,6);
                }

                created = new Date();
                created.setUTCFullYear(year);
                created.setUTCMonth(month);
                created.setUTCDate(day);
                created.setUTCHours(hour);
                created.setUTCMinutes(minute);
                created.setUTCSeconds(second);

            }

            vals.unshift("'James'");
            vals.unshift("'"+req.body.file+"'");
            vals.unshift("'"+created.getUTCDate()+"'");
            vals.unshift("'"+created.getUTCMonth()+"'");
            vals.unshift("'"+created.getUTCFullYear()+"'");
            vals.unshift("'"+created.toJSON()+"'");
            vals = vals.toString();

            pg.connect(connectionString, function(error, client, done){
                var query = client.query("INSERT INTO images("+cols+") values("+vals+")", function(error, result){

                    if(error){
                        console.log(error);
                        res.status(200).send(error);
                    }
                })
                query.on('end', function(result){
                    console.log(result);
                    client.end();
                    res.send(result);

                })
            })

        }

        else{
            res.status(200).send('Creation Data Missing: ' +  req.body.file);
        }

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