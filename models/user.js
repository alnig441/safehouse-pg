var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 12;

var UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true },
    password: {type: String, required: true},
    lang: String,
    acct_type: String,
    last_login: Date
})

UserSchema.pre('save', function(next){
    console.log('in schema pre');
    var user = this;

    if(!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if(err) return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
            if(err) return next(err);

            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function (candidatePassword, callback) {
    console.log('in compare password printing user: ', this);
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        console.log("in bcrypt compare function");
        if (err){
            return callback(err);
        } else {
            return callback(null, isMatch);
        }
    });
};

module.exports = mongoose.model('User', UserSchema);
