var express = require('express');
var router = express.Router();

var nodemailer = require('nodemailer');
var SMTPServer = require('smtp-server').SMTPServer;

router.post('/', function(req, res, next){

    console.log('req body: ', req.body);

    var mailOpts, transporter, GMXtransporter;

    var server = new SMTPServer({
        logger: true,
        onData(stream, session, callback){
            stream.pipe(process,stdout);
            stream.on('end',callback);
    }
    });

    server.listen(465, 'localhost', function(x){
        console.log(x);
    });

    server.on('error', function(err){
        if(err){
            console.log('server error: ', err);
        }
    })

    //GMXtransporter = nodemailer.createTransport({
    //    host: 'mail.gmx.com',
    //    port: 465,
    //    secure: true,
    //    auth: {
    //        user: "allan.nielsen@gmx.com",
    //        pass: "always0k"
    //    }
    //});

    transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: "cleland.nielsen@gmail.com",
            pass: "Alw@ys0k"
        }
    });

    mailOpts = {
        from: req.body.email,
        //from: "allan.nielsen@gmail.com",
        to: "alnig441@gmail.com",
        subject: "Project Request Form",
        text: "Name: " + req.body.name + "\nReply To: " + req.body.email + "\nCompany: " + req.body.company +  "\nBudget: " + req.body.budget + "\n\nProject Description: \n"+ req.body.project,
    };

    transporter.sendMail(mailOpts, function(error, info){

        console.log('do you see me?');

        if(error) {
            console.log('error message: ', error);
            res.send(error);
        }
        else {
            console.log('message response: ', info);
            res.send(info);
        }
    })

});

module.exports = router;