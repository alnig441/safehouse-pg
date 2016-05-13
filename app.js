var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var localStrategy = require('passport-local');
var bcrypt = require('bcrypt');

var pg = require('pg'),
    connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';
/*

 pg.connect(connectionString, (function(err, client, done){
 var hash = bcrypt.hashSync(process.env.PASSWORD, 12);

 var query = client.query("INSERT INTO users(username, password, acct_type) values($1, $2, $3)", [process.env.USERNAME, hash, process.env.ACCT_TYPE]);
 }))

*/


var routes = require('./routes/index');
var login = require('./routes/login');
var logout = require('./routes/logout');
var admin = require('./routes/admin_crud');
var event = require('./routes/event_crud');
var search = require('./routes/search');
var storages = require('./routes/storages');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'mysecret' || process.env.SECRET,
    key: 'user',
    resave: 'true',
    saveUnitialized: false,
    cookie: { maxAge: null, secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use('local', new localStrategy({
        passReqToCallback: true,
        usernameField: 'username'
    },
    function(req, username, password, done) {
        pg.connect(connectionString, function(err, client){
            var query = client.query("SELECT * FROM users WHERE username='" + username.toLowerCase() + "'", function(error, result){
                if(error) {throw error;}
            });
            var user;
            query.on('row', function(row){
                user = row;
                if(!user){
                    res.send('no user found');
                }
                else{
                    bcrypt.compare(password, user.password, function(err, isMatch){
                        if(err){console.log(err);}
                        if(isMatch){
                            return done(null, user);
                        }
                        else{
                            done(null, false);
                        }
                    })
                }

            });

            query.on('end', function(result){
                client.end();
            });
        })

    }));


passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    pg.connect(connectionString, function(err, client){
        client.query("SELECT * FROM users WHERE id='" + id + "'", function(error, result){
            client.end();
            var user = result.rows[0];
            done(null, user);
        })
    })
});




app.use('/', routes);
app.use('/login', login);
app.use('/logout', logout);
app.use('/admin_crud', admin);
app.use('/event_crud', event);
app.use('/search', search);
app.use('/storages', storages);

app.use(express.static(path.join(__dirname, 'public')));



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
