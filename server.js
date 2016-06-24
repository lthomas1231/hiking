// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var mongodb = require("mongodb");
var client = require('mongodb').MongoClient;
var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost:27017/hiking';
 var db;

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
	// set headers for cross domain in middle ware so it's used for all requests
	 res.header("Access-Control-Allow-Origin", "*");
 	 res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
 	 res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
	next(); //make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// more routes for our API will happen here

router.route('/addvisited').post(function(req,res) {
	console.log('inside the function addvisited');
	console.log('request: ' + req.body);
	client.connect(mongoUri, function(err, db) {
		console.log('connected to db');
		db.createCollection("visited", function(err, visitedRecords) {
			visitedRecords.insert({"trailhead": req.body.trailhead, "date": req.body.date, "lat": req.body.lat, "lon": req.body.lon, "comments": req.body.comments}, function() {
				console.log('inserted the record')});
			res.json('Added trailhead ' + req.body.trailhead + ' to visited db');
		});
	});
});

router.route('/deletevisited').post(function(req,res) {
	client.connect(mongoUri, function(err, db) {
		db.createCollection("visited", function(err, visitedRecords) {
			// remove object that has given lat/lon/trailhead
			visitedRecords.remove({
				"lat": req.body.lat, 
				"lon": req.body.lon, 
				"trailhead": req.body.trailhead}, 
				function() {
				console.log('deleted the record')});

			res.json('Removed trailhead ' + req.body.trailhead + ' from visited db');
		});
	});
});


router.route('/getvisited').get(function(req,res) {
	client.connect(mongoUri, function(err, db) {
		db.createCollection("visited", function(err, visitedRecords) {
			if (err) {
				console.log('first error ' + err);
			}
			visitedRecords.find({}).toArray(function(error, result) {
    			if (err) throw error;

    			// return jsonp for cross origin issues
    			res.jsonp(result);
			});
		});
	});
});

router.route('/gethikefortrailhead').get(function(req,res) {
	client.connect(mongoUri, function(err, db) {
		db.createCollection("visited", function(err, visitedRecords) {
			if (err) {
				console.log('first error ' + err);
			}
			visitedRecords.find({trailhead:req.query.trailhead}).toArray(function(error, result) {
    			if (err) throw error;

    			// return jsonp for cross origin issues
    			res.jsonp(result);
			});
		});
	});
});


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);
app.use(express.static(__dirname));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

