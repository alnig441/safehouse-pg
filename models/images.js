var mongoose = require('mongoose');

var ImageSchema = new mongoose.Schema({
    url: {type: String, required: true},
    created: Date,
    meta: []
});

ImageSchema.pre('save', function(next){
    console.log('in image pre_save ', this.created);
    if(this.created === null){
        var today = new Date();
        this.created = today;
    }
    next();
});

module.exports = mongoose.model('Image', ImageSchema);