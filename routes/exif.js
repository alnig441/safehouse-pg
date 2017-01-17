/**
 * Created by allannielsen on 1/10/17.
 */

var express = require('express');
var router = express.Router();
var call = require('../public/javascripts/myFunctions.js');
var ExifImage = require('exif').ExifImage;

function convertGPSCoordinate(coordinate, coordinateReference){
    var conversion;

    console.log('incoming coordinate:', coordinate);

    coordinate.forEach(function(elem,ind){
        switch (ind){
            case 0:
                conversion = elem;
                break;
            case 1:
                conversion += elem/60;
                break;
            case 2:
                conversion += elem/3600;
                break;
        }
    })

    if(coordinateReference.toLowerCase()==='w' || coordinateReference.toLowerCase() ==='s'){
        conversion = '-' + conversion.toString();
    }
    return conversion;
}

router.get('/:file', call.isAuthenticated, function(req, res, next){

    new ExifImage({ image : './public/buffalo/James/'+ req.params.file }, function (error, exifData) {

        var timestamp, coordinates, lng, lat;

        if(exifData) {

            console.log('exif gps: ', exifData.gps);

            //DETERMINE IF GPS DATA AVAILABLE

            if (exifData.gps.GPSLongitude && exifData.gps.GPSLatitude) {

                //ELIMINATION OF GMT OFF-SET FOR IMAGES IMPORTED FROM ANDROID DEVICE

                if(!exifData.exif.DateTimeOriginal){

                    var file = req.params.file.split('_')[2].split('.')[0];
                    var time_str = exifData.gps.GPSTimeStamp;
                    time_str[0] = file.slice(0,2);
                    var date_str = exifData.gps.GPSDateStamp.replace(/:/g, "-");
                    timestamp = date_str + ' ' + time_str.join(':') + 'Z';

                }

                lng = convertGPSCoordinate(exifData.gps.GPSLongitude, exifData.gps.GPSLongitudeRef);

                lat = convertGPSCoordinate(exifData.gps.GPSLatitude, exifData.gps.GPSLatitudeRef);

            }

            //DETERMINE IF LOCAL TIME TIMESTAMP AVAILABLE

            if (exifData.exif.DateTimeOriginal) {

                var dto = exifData.exif.DateTimeOriginal.split(' ');

                var dto_0 = dto[0].split(':');

                timestamp = dto_0.join('-') + ' ' + dto[1] + 'Z';

            }

        }

        if(lng && lat){
            coordinates = lat + ',' + lng;
        }

        res.send({created: timestamp, coordinates: coordinates, API_KEY: process.env.API_KEY});

    });

});

module.exports = router;