var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var localStrategy = require('passport-local');

//POSTGRESS REFACTOR
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';
var bcrypt = require('bcrypt');
//POSTGRESS REFACTOR

var fs = require('fs');
var file = path.join(__dirname, '/access.log');

var routes = require('./routes/index');
var login = require('./routes/login');
var admin = require('./routes/admin_crud');
var event = require('./routes/event_crud');
var download = require('./routes/download');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

/*
pg.connect(connectionString, (function(err, client, done){
  var hash = bcrypt.hashSync(process.env.PASSWORD, 12);
  console.log(hash.length);

  var query = client.query("INSERT INTO users(username, password, acct_type) values($1, $2, $3)", [process.env.USERNAME, hash, process.env.ACCT_TYPE]);
}))
*/

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'mysecret' || process.env.SECRET,
  key: 'user',
  resave: 'true',
  saveUnitialized: false,
  cookie: { maxAge: 60000, secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use('local', new localStrategy({
      passReqToCallback: true,
      usernameField: 'username'
    },
    function(req, username, password, done) {
      console.log('in passport', req.isAuthenticated());


      //POSTGRES REFACTOR
      pg.connect(connectionString, function(err, client){
        console.log(username);
        var query = client.query("SELECT * FROM users WHERE username='" + username + "'", function(error, result){
          if(error) {throw error;}
        });

        var user;
        query.on('row', function(row){
          user = row;
        });

        query.on('end', function(result){
          client.end();
          //console.log('query.on end: ', user);
          if(!user){
            console.log('no user');
          }
          else{
            bcrypt.compare(password, user.password, function(err, isMatch){
            console.log('bcrypt compare');
            if(err){console.log(err);}
            if(isMatch){
              console.log('password is a match', req.isAuthenticated());
              //console.log('pg refactor: ');
              return done(null, user);
            }
            else{
              console.log('unauthorized');
              done(null, false);
            }
          });
          }
        //return done(null, user);
        });
      })


      //POSTGRES REFACTOR END

    })
);


passport.serializeUser(function(user, done){
  console.log('serializing ', user)
  done(null, user.username);
});

passport.deserializeUser(function(id, done){
  console.log("deserializing ", id);

  pg.connect(connectionString, function(err, client, done){
    var query = client.query("SELECT * FROM users WHERE username='"+id+"'", function(error, result){
      if(error){done(error);}
      console.log(result.rows);
      done(null, result);
    })
  })
});


app.use('/', routes);
app.use('/login', login);
app.use('/admin_crud', admin);
app.use('/event_crud', event);
app.use('/download', download);

app.use(express.static(path.join(__dirname, 'template')));



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
