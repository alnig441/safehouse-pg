var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
    event_da: {type: String, required: true},
    event_en: {type: String, required: true},
    image_url:String,
    created: Date
});

EventSchema.pre('save', function(next){
    var today = new Date();
    this.created = today;
    next();
});

module.exports = mongoose.model('Event', EventSchema);
