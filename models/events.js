var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
    event_da: {type: String, required: true},
    event_en: {type: String, required: true},
    url: {type: String, required: true},
    created: Date
});

EventSchema.pre('save', function(next){
    console.log('in event pre save');
    var today = new Date();
    this.created = today;
    next();
});

module.exports = mongoose.model('Event', EventSchema);
