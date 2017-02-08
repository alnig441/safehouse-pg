var express = require('express');
var router = express.Router();
var call = require('../public/javascripts/myFunctions.js');
var ExifImage = require('exif').ExifImage;
var https = require('https');

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

function getGMTOffset (coordinates, timestamp, callback) {

    var now = new Date(timestamp);
    timestamp = Date.parse(now);
    console.log('timestamp in: ', new Date(timestamp));

    https.get('https://maps.googleapis.com/maps/api/timezone/json?location='+ coordinates +'&timestamp='+ timestamp.toString().slice(0,10) +'&key=' + process.env.API_KEY, function(res) {

        var payload = '';

        res.on('data', function (data) {
            payload += data;
        });

        res.on('error', function(error){
            console.log('show me error');
        })

        res.on('end', function(){
            var body = JSON.parse(payload);
            var offset = (body.rawOffset + body.dstOffset)*1000;

            callback({
                timestamp: timestamp += offset
            });
        })

    })

}

function getLocationData (coordinates, callback) {

    https.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + coordinates + '&key=' + process.env.API_KEY, function(res) {

        var payload = '';

        res.on('data', function (data) {
            payload += data;
        });

        res.on('error', function(error){
            console.log('show me error');
        })

        res.on('end', function(){
            var body = JSON.parse(payload);
            var addressComponents = body.results[0].address_components;
            var imgObj = {};

            if(body.status === 'OK'){

                parseLocationData(addressComponents, 'country') ? imgObj.country = parseLocationData(addressComponents, 'country').long_name : imgObj.country = 'En Route';
                parseLocationData(addressComponents, 'administrative_area_level_1') ? imgObj.state = parseLocationData(addressComponents, 'country').short_name + ' - ' + parseLocationData(addressComponents, 'administrative_area_level_1').long_name: imgObj.state = 'N/a';
                parseLocationData(addressComponents,'point_of_interest') ? imgObj.meta.push(parseLocationData(addressComponents,'point_of_interest').long_name) : imgObj.meta = imgObj.meta;

                if(parseLocationData(addressComponents, 'locality')){
                    if(parseLocationData(addressComponents, 'route') && parseLocationData(addressComponents, 'route').short_name === 'Ellsworth Dr'){
                        imgObj.city = 'Edina';
                    }else{
                        imgObj.city = parse(addressComponents, 'locality').long_name;
                    }
                }else {
                    imgObj.city = 'En Route';
                }


                callback(
                        imgObj
                );

            }
            else if(body.status = 'ZERO_RESULTS'){

                callback({
                    addressComponents: undefined
                });

            }

        })

    })


}

function parseLocationData (locationData, target) {

    var locationDataObject,i;

    for(i = 0; i < locationData.length; i++){
        locationData[i].types.forEach(function(elem,ind){
            if(elem === target){
                locationDataObject = locationData[i];
            }
        })
    }
    return locationDataObject;

}

router.get('/:file', call.isAuthenticated, function(req, res, next){

    new ExifImage({ image : './public/buffalo/James/'+ req.params.file }, function (error, exifData) {

        var timestamp, coordinates, lng, lat;

        if(exifData) {

            //DETERMINE IF GPS DATA AVAILABLE

            if (exifData.gps.GPSLongitude && exifData.gps.GPSLatitude) {

                //USE GPS TIME/DATE IF AVAILABLE

                if(exifData.gps.GPSDateStamp){

                    console.log('using gps timestamp');

                    var date_str = exifData.gps.GPSDateStamp.replace(/:/g, "-");
                    var time_str = exifData.gps.GPSTimeStamp.join(':');
                    timestamp = date_str + ' ' + time_str;


                }

                lng = convertGPSCoordinate(exifData.gps.GPSLongitude, exifData.gps.GPSLongitudeRef);

                lat = convertGPSCoordinate(exifData.gps.GPSLatitude, exifData.gps.GPSLatitudeRef);

            }

            //ELSE USE LOCAL TIMESTAMP (TYPICALLY ONLY AVAILABLE ON IPHONE)

            else if (exifData.exif.DateTimeOriginal) {

                console.log('using local timestamp');

                var dto = exifData.exif.DateTimeOriginal.split(' ');

                var dto_0 = dto[0].split(':');

                timestamp = dto_0.join('-') + ' ' + dto[1] + 'Z';

            }

        }

        if(lng && lat){
            coordinates = lat + ',' + lng;
        }

        //RASPBERRY PI RUNNING UTC TIME - ADJUST TIME FOR GMT OFFSET TO GET CORRECT LOCAL TIME

        getGMTOffset(coordinates, timestamp, function(adjustedTime){

            //BUILD IMAGE OBJECT WITH LOCATION DATA RETRIEVED FROM GOOGLE

            getLocationData(coordinates, function(imageObject){

                imageObject.created = adjustedTime.timestamp;

                res.send(imageObject);


            });


        });

    });

});


module.exports = router;