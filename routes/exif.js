/**
 * Created by allannielsen on 1/10/17.
 */

var express = require('express');
var router = express.Router();
var call = require('../public/javascripts/myFunctions.js');
var ExifImage = require('exif').ExifImage;

function convertGPS(arr, ref){
    var result;

    arr.forEach(function(elem,ind){
        switch (ind){
            case 0:
                result = elem;
                break;
            case 1:
                result += elem/60;
                break;
            case 2:
                result += elem/3600;
                break;
        }
    })

    if(ref.toLowerCase()==='w' || ref.toLowerCase() ==='s'){
        result = '-' + result.toString();
    }
    return result;
}

router.get('/:file', call.isAuthenticated, function(req, res, next){

    var lng,lat,created, timestamp;

    console.log('show me file: ', req.params.file);

    new ExifImage({ image : './public/buffalo/James/'+ req.params.file }, function (error, exifData) {

        if(exifData) {

            //NEXUS
            if (exifData.gps.GPSDateStamp) {

                var file = req.params.file.split('_')[2].split('.')[0];

                //ELIMINATION OF GMT OFF-SET FOR IMAGES IMPORTED FROM ANDROID DEVICE
                var time_str = file.slice(0,2) + ':' + file.slice(2,4) + ':' + file.slice(4,6);

                var date_str = exifData.gps.GPSDateStamp.replace(/:/g, ".");

                lng = convertGPS(exifData.gps.GPSLongitude, exifData.gps.GPSLongitudeRef);

                lat = convertGPS(exifData.gps.GPSLatitude, exifData.gps.GPSLatitudeRef);

                timestamp = date_str + ' ' + time_str + 'Z';

            }
            //IPHONE
            else if (exifData.exif.DateTimeOriginal) {

                var dto = exifData.exif.DateTimeOriginal.split(' ');

                var dto_0 = dto[0].split(':');

                timestamp = dto_0.join('-') + ' ' + dto[1] + 'Z';

            }

        }

        res.send({created: timestamp , coordinates: lat + ',' + lng});

    });

});

module.exports = router;