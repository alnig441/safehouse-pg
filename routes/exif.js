var express = require('express');
var router = express.Router();
var call = require('../public/javascripts/myFunctions.js');
var ExifImage = require('exif').ExifImage;
var https = require('https');

function convertGPSCoordinate(coordinate, coordinateReference){
    var conversion;

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
    });

    if(coordinateReference.toLowerCase()==='w' || coordinateReference.toLowerCase() ==='s'){
        conversion = '-' + conversion.toString();
    }
    return conversion;
}

function getGMTOffset (coordinates, timestamp, callback) {

    console.log('GMT Offset - received timestamp:', timestamp, '\nand coordinates: ', coordinates);

    var now = new Date(timestamp.created);
    timestamp.created = Date.parse(now);

    https.get('https://maps.googleapis.com/maps/api/timezone/json?location='+ coordinates +'&timestamp='+ timestamp.created.toString().slice(0,10) +'&key=' + process.env.API_KEY, function(res) {

        var payload = '';

        res.on('data', function (data) {
            payload += data;
        });

        res.on('error', function(error){
            console.log('show me error');
        });

        res.on('end', function(){
            var body = JSON.parse(payload);
            var offset = (body.rawOffset + body.dstOffset)*1000;
            var timeObj = {};
            var now;

            if(timestamp.gps){
                now = new Date(timestamp.created + offset);
            } else{
                now = new Date(timestamp.created);
            }

            console.log('show me now: ', now, '\n..and body: ', body);

            timeObj.created = timestamp.created;
            timeObj.month = now.getUTCMonth().toString();
            timeObj.day = now.getUTCDate();
            timeObj.year = now.getUTCFullYear();
            timeObj.offset = offset;

            callback(
                timeObj
            )

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
        });

        res.on('end', function(){
            var body = JSON.parse(payload);
            var imgObj = {};
            imgObj.meta = [];

            if(body.status === 'OK'){

                var addressComponents = body.results[0].address_components;

                parseLocationData(addressComponents, 'country') ? imgObj.country = parseLocationData(addressComponents, 'country').long_name : imgObj.country = 'En Route';
                parseLocationData(addressComponents, 'administrative_area_level_1') ? imgObj.state = parseLocationData(addressComponents, 'country').short_name + ' - ' + parseLocationData(addressComponents, 'administrative_area_level_1').long_name: imgObj.state = 'N/a';
                parseLocationData(addressComponents,'point_of_interest') ? imgObj.meta.push(parseLocationData(addressComponents,'point_of_interest').long_name) : imgObj.meta = imgObj.meta;

                if(parseLocationData(addressComponents, 'locality')){
                    if(parseLocationData(addressComponents, 'route') && parseLocationData(addressComponents, 'route').short_name === 'Ellsworth Dr'){
                        imgObj.city = 'Edina';
                    }else{
                        imgObj.city = parseLocationData(addressComponents, 'locality').long_name;
                    }
                }else {
                    imgObj.city = 'En Route';
                }

                if(imgObj.meta.length == 0){
                    imgObj.meta = undefined;
                }


                callback(
                    imgObj
                );

            }
            else if(body.status === 'ZERO_RESULTS'){

                imgObj = {};

                callback(
                    imgObj
                );

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


function getCoordinates(location, callback) {

    var payload = '';

    https.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + location + '&key=' + process.env.API_KEY, function(res){

        res.on('data', function(data){
            payload += data;
        });

        res.on('error', function(error){
            console.log(error);
        });

        res.on('end', function(){
            var body = JSON.parse(payload);
            var newLocation = {};

            if(body.status === 'OK'){

                newLocation.lat = body.results[0].geometry.location.lat;
                newLocation.lng = body.results[0].geometry.location.lng;

            }

            callback(newLocation);

        });
    })

}

router.post('/', call.isAuthenticated, function(req, res, next){

    new ExifImage({ image : './public/buffalo/James/'+ req.body.file }, function (error, exifData) {

        var location, newImg = req.body, timestamp = {}, coordinates ='', lng, lat, imgObj = {},flip = 1;

        //FILE IS CATEGORISED AND NEEDS UPDATING OR FILE IS NEW AND NEEDS TIMESTAMP ADJUSTED
        if((req.body.occasion && (!exifData || !exifData.gps.GPSDateStamp)) || (!req.body.occasion  && exifData && !exifData.gps.GPSDateStamp)){
            console.log('flipping');
            flip = -1;
        }

        //INITIALISATION OF location VARIABLE - WILL BE OVERWRITTEN BY EXIF DATA, IF AVAILABLE
        req.body.state != 'N/a' ? location = req.body.state : location = req.body.country;

        //INITIALISATION OF TIMESTAMP - WILL BE OVERWRITTEN BY EXIF DATA, IF AVAILABLE
        req.body.created ? timestamp.created = req.body.created : timestamp.created = 'no valid date present';

        //DETERMINE IF FILE IS NEW
        req.body.occasion ? newImg = false : newImg = true;

        //FOR IMAGES WITHOUT EXIFDATA DO
        if(!exifData){

            console.log('exif?  NO');


            if(!newImg){

                console.log('new image? NO')

                getCoordinates(location, function(newCoordinates){

                    coordinates += newCoordinates.lat + ',' + newCoordinates.lng;

                    getGMTOffset(coordinates, timestamp, function(timeObject){

                        imgObj.created = new Date(timeObject.created + flip * timeObject.offset);

                        console.log('sending: ', imgObj);

                        res.send(imgObj);


                    });

                });

            }

            else {

                console.log('new image? YES')

                imgObj.created = req.body.created;

                console.log('sending: ', imgObj);

                res.send(imgObj);

            }

        }

        //FOR IMAGES WITH EXIFDATA DO
        else{

            console.log('exif? YES');

            if(!exifData.gps.GPSDateStamp){

                console.log('GPS timestamp? NO');

                if(!exifData.exif.DateTimeOriginal){

                    console.log('date/time original? NO')

                    if(!newImg) {

                        getCoordinates(location, function (newCoordinates) {

                            coordinates += newCoordinates.lat + ',' + newCoordinates.lng;

                            getGMTOffset(coordinates, timestamp, function (timeObject) {

                                imgObj.created = new Date(timeObject.created + flip * timeObject.offset);

                                console.log('sending: ', imgObj);

                                res.send(imgObj);


                            });

                        });
                    }

                    else{

                        imgObj.created = 'no valid date present';

                        console.log('sending: ', imgObj);

                        res.send(imgObj);

                    }

                }

                else {

                    //SET TIMESTAMP BASED ON DATE/TIME ORIGINAL
                    var dto = exifData.exif.DateTimeOriginal.split(' ');
                    var dto_0 = dto[0].split(':');
                    timestamp.created = dto_0.join('-') + ' ' + dto[1] +'Z';

                    console.log('date/time original? YES \n timestamp: ', timestamp);

                    getCoordinates(location, function(newCoordinates){

                        coordinates += newCoordinates.lat + ',' + newCoordinates.lng;

                        getGMTOffset(coordinates, timestamp, function(timeObj){

                            console.log('timeObj: ', timeObj);

                            imgObj.created = new Date(timeObj.created + flip * timeObj.offset);

                            console.log('sending: ', imgObj);

                            res.send(imgObj);

                        })

                    })

                }

            }

            else {
                console.log('GPS timestamp? YES');

                timestamp.gps = true;

                //SET COORDINATES
                lng = convertGPSCoordinate(exifData.gps.GPSLongitude, exifData.gps.GPSLongitudeRef);
                lat = convertGPSCoordinate(exifData.gps.GPSLatitude, exifData.gps.GPSLatitudeRef);

                //SET TIMESTAMP
                var date_str = exifData.gps.GPSDateStamp.replace(/:/g, "-");
                var time_str = exifData.gps.GPSTimeStamp.join(':');

                coordinates += lat + ',' + lng;

                timestamp.created = date_str + ' ' + time_str;


                getGMTOffset(coordinates, timestamp, function(timeObj){

                    console.log('GPS timestamp: ', timestamp, '\ntimeObj: ', timeObj, '\nflip bit: ', flip);

                    imgObj.created = new Date(timestamp.created);

                    for(var prop in timeObj){
                        if(prop && prop != 'offset' && prop != 'created'){
                            imgObj[prop] = timeObj[prop];
                        }
                    }

                    getLocationData(coordinates, function(locationObj){

                        for(var prop in locationObj){
                            if(prop){
                                imgObj[prop] = locationObj[prop];
                            }
                        }

                        console.log('sending: ', imgObj);

                        res.send(imgObj);

                    });

                });

            }

        }

    })

});


module.exports = router;