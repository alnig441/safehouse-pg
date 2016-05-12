var express = require('express'),
    router = express.Router(),
    passport = require('passport');

router.post('/authenticate',
    passport.authenticate('local'),
    function(req, res){
        var user = {};
        user.username = req.user.username;
        user.acct_type = req.user.acct_type;
        user.lang = req.user.lang;
        user.storages = req.user.storages;
        res.send(user);
});

module.exports = router;