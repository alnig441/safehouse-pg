var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';
var multer = require('multer');

var storage  = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './public/images/')
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
});
var upload = multer({storage: storage});

router.get('/test', function(req, res){
    res.send('some message');
})

router.post('/add', function(req, res) {
    console.log('in event_crud adding ', req.body.event_da);

    //POSTGRES REFACTOR SAVE IMAGE
    pg.connect(connectionString, function (err, client, done) {
        var array = splitString(req.body.meta);
        var query = client.query("INSERT INTO images(url, created, meta) values($1, $2, $3)", [req.body.url, req.body.created, array], function (error, result) {
            if (error) { res.send(error.detail);}
            else { res.send('image saved');}
        })
        query.on('end', function (result) {
            //console.log(result);
        })
    })
    //POSTGRES REFACTOR SAVE IMAGE END

    //POSTGRES REFACTOR SAVE EVENT
    if (req.body.event_da != 'undefined' || req.body.event_en != 'undefined') {
        pg.connect(connectionString, function (err, client, done) {

            var query = client.query("INSERT INTO events (event_da, event_en, url, created) values($1, $2, $3, $4)", [req.body.event_da, req.body.event_en, req.body.url, req.body.created], function (error, result) {
                if (error) {console.log('there was an error ', error.detail);}
            })
            query.on('end', function (result) {
                //console.log(result);
            })
        })
    }
    //POSTGRES REFACTOR SAVE EVENT END


});

router.post('/upload', upload.single('file'), function(req, res, next){
    //console.log('upload',req.file);
    res.status(200);
});

router.get('/view', function(req, res){
    console.log('in event get');
    //POSTGRES REFACTOR GET LATEST EVENT
    pg.connect(connectionString, function(error, client, done){

        var event;
        var query = client.query("DECLARE geturl CURSOR FOR SELECT * FROM events; FETCH LAST FROM geturl", function(error, result){
            if(error){ console.log('theres was an error ', error.detail);}
            //else{ console.log('printing result: ', result.rows);}
        })
        query.on('row', function(row){
            //console.log('printing row ', row);
            event = row;
        })

        query.on('end', function(result){
            console.log(event.url);
            res.send(event);
        })
    })


    //POSTGRES REFACTOR GET LATEST EVENT END

});

function isAuthenticated (req, res, next){
    console.log(req.isAuthenticated());
    if(req.isAuthenticated()){
        return next;
    }
    res.send('unauthorized')
}

//splittig meta data string from form into an array of meta data
function splitString(meta){
    var separator = ' ';
    var temp = meta.split(separator);
    return temp;
};


module.exports = router;