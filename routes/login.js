var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET authenticated. */
router.post('/authenticate',
    passport.authenticate('local'),
    function(req, res){
    console.log('user authenticated', req.user);
        var user = {};
        user.username = req.user.username;
        user.acct_type = req.user.acct_type;
        user.lang = req.user.lang;
        res.send(user);
});

module.exports = router;
