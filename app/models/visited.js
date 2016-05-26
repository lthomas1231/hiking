var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VisitedSchema = new Schema({
	trailhead: String,
	date: String,
	lat: String,
	lon: String,
	comments: String
});

module.exports = mongoose.model('Visted', VisitedSchema);