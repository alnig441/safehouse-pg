var express = require('express');
var router = express.Router();
var path = require('path');


router.get('/file/:url', function(req, res){
    console.log('in download route ', req.body, req.params);
    //this.use('/private/images/', express.static('private'));

    var options = {
        root: __dirname + '/images/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    var fileName = req.params.url;
    res.sendFile(fileName, options, function(err){
        if(err){
            console.log(err);
            res.status(err.status).end();
        }
        else {
            console.log('sent: ', fileName);
        }
    })
})

module.exports = router;