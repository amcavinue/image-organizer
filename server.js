/**
 * Modules
 */
var express = require('express');
var util = require('util');
var mongoose = require('mongoose');
var path = require('path');
var config = require('./config');
var Image = require('./models/image.js');
var Tag = require('./models/tag.js');

var app = express();
app.use(express.static('public'));  // Serve the public folder.
app.use('/scripts', express.static(__dirname + '/node_modules/')); // Serve the node_modules folder.

/**
 * Routes
 */
app.get('/images', function(req, res) {
    Image.find(true).populate('tags').then(function(docs) { res.json(docs); });
});

app.get('/images/:name', function(req, res) {
   // Image.find({name: ''}) 
});

/*app.post('/:imageId/image', function(req, res) {
     // Upload the image.
});*/

/**
 * Run the server
 */
var runServer = function(callback) {
    mongoose.connect(config.DATABASE_URL, function(err) {
        if (err && callback) {
            return callback(err);
        }

        app.listen(config.PORT, function() {
            console.log('Listening on localhost:' + config.PORT);
            if (callback) {
                callback();
            }
        });
    });
};

// If command line: node server.js
// run the runServer function with callback.
if (require.main === module) {
    runServer(function(err) {
        if (err) {
            console.error(err);
        }
    });
};

/**
 * Exports
 */
exports.app = app;
exports.runServer = runServer;
