/**
 * Modules
 */
var express = require('express');
var util = require('util');
var mongoose = require('mongoose');
var path = require('path');

var config = require('./config');

var app = express();

app.use(express.static('public'));  // Serve the public folder.
app.use('/scripts', express.static(__dirname + '/node_modules/')); // Serve the node_modules folder.


app.listen(process.env.PORT || 8080);
exports.app = app;

/**
 * Variables
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


/**
 * Routes
 */
 app.get('/:imageId/edit', function(req, res) {
     res.sendFile(path.join(__dirname + '/public/edit.html'));
});

/*app.post('/:imageId/image', function(req, res) {
     // Upload the image.
});*/
