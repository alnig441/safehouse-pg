var express = require('express');
var router = express.Router();

var nodemailer = require('nodemailer');
var SMTPServer = require('smtp-server').SMTPServer;
var SMTPConnection = require('nodemailer/lib/smtp-connection');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

router.post('/', function(req, res, next){

    var mailOpts, GMAILtransporter, GMXtransporter, envelope, connectionReady, message, SMtransporter;

    message = 'NAME: '+ req.body.name +'\nREPLY TO: '+ req.body.email +'\nCOMPANY/WWW: '+ req.body.company + '\nBUDGET: '+ req.body.budget + '\nPROJECT: \n' + req.body.project;

    envelope = {
        from: req.body.email,
        to: 'allan.nielsen@gmx.com',
        subject: 'Project Request Form'
    }

    var server = new SMTPServer();

    //var server = new SMTPServer({
    //    onAuth(auth, session, callback){
    //    if(auth.username !== req.body.email || auth.password !== '1234'){
    //        return callback(new Error('Invalid username or password'));
    //    }
    //    callback(null, {user: req.body.email}); // where 123 is the user id or similar property
    //}
    //});

    server.listen();
    //
    //
    server.on('error', function(err){
        if(err){
            console.log('server error: ', err);
        }
    });

    var connection = new SMTPConnection({
        //port: 7700,
        host: 'localhost',
        logger: true,
        //secure: false,
        ////ignoreTLS: true,
        //requireTLS: true,
        //name: req.body.email,
        //authMethod: ['PLAIN', 'LOGIN']
    });

    //connection.on('error', function(err){
    //    console.log('connection error: ',err);
    //});
    //
    //connection.connect(function(data){
    //
    //    connection.login({
    //        user: req.body.email,
    //        pass: '1234'
    //    },function(error){
    //
    //        if(error){
    //            console.log('authentication error: ', error.response);
    //            connection.quit();
    //        }
    //        else {
    //            connection.send(envelope, message, function(err, info){
    //                if(err){
    //                    console.log('error sending message: ', err);
    //                }
    //                if(info){
    //                    console.log('information re sent message: ', info.response, '\n', envelope, '\n', message);
    //
    //                }
    //                connection.quit();
    //            })
    //        }
    //    })
    //
    //});


    GMAILtransporter = nodemailer.createTransport({
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
        text: message
    };

    GMAILtransporter.sendMail(mailOpts, function(error, info){

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