var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var localStrategy = require('passport-local');
var mongoose = require('mongoose');
var User = require('./models/user');

var routes = require('./routes/index');
var login = require('./routes/login');
var admin = require('./routes/admin_crud')

var data = {
  username: 'admin',
  password: 'admin',
  acct_type: 'admin'
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var dbURI = 'mongodb://localhost:27017/starting_over';
mongoose.connect(dbURI);

mongoose.connection.on('connected', function(){
  console.log('Mongoose default connection open to: ', dbURI);
})

mongoose.connection.on('error', function(err){
  console.log('Mongoose connection failed with ', err);
})

User.findOne({username:'admin'}, function(err, result){
  if(result === null){
    var user = new User(data);
    user.save(function(err){
      if(err)console.log(err);
    });
  }
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secret',
  key: 'user',
  resave: 'true',
  saveUnitialized: false,
  cookie: { maxAge: 6000, secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use('local', new localStrategy({
      passReqToCallback: true,
      usernameField: 'username'
    },
    function(req, username, password, done) {
      console.log('in passport: ', req.body);
      User.findOne({username: username}, function (err, user) {
        if (err){
          throw err;}
        if (!user) {
          console.log('user does not exist', done);
          //return done(null, false, {message: 'Incorrect username and password.'});
          return done(null, false);


        }
        console.log('in passport having received user: ', user);
        user.comparePassword(password, function (err, isMatch) {
          if (err) {
            console.log(err);
            throw err;
          }
          if (isMatch) {
            return done(null, user);
          }else{
            console.log('BINGO');

            //done(null, false, {message: 'Incorrect username and password.'});
            done(null, false);
          }


        });
      });
    }));


passport.serializeUser(function(user, done){
  //console.log('serializing ', user)
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  //console.log("deserializing ", id);
  User.findById(id, function(err, user){
    if(err) done(err);
    done(null, user);
  });
});


app.use('/', routes);
app.use('/login', login);
app.use('/admin_crud', admin);
app.use(express.static(path.join(__dirname, 'private')));


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
