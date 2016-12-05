/**
 * Modules
 */
var express = require('express');
var util = require('util');
var mongoose = require('mongoose');
var path = require('path');
var config = require('./config');
var fs = require('fs');
var multer = require('multer');
var uuid = require('uuid');
var Image = require('./models/image.js');
var Tag = require('./models/tag.js');

var app = express();
app.use(express.static('public'));  // Serve the public folder.
app.use('/scripts', express.static(__dirname + '/node_modules/')); // Serve the node_modules folder.

// The destination and filenames for uploads.
var storage = multer.diskStorage({ 
    destination: './public/images',
    filename: function(req, file, cb) {
        var filename = uuid.v4() + '-' + file.originalname;
        cb(null, filename);
    }
});
var uploads = multer({ storage: storage });

/**
 * Routes
 */
app.get('/images', function(req, res) {
    Image.find(true).populate('tags').then(function(docs) { res.json(docs); });
});

app.get('/images/:name', function(req, res) {
    Image.find({name: req.params.name}).populate('tags').then(function(docs) { res.json(docs); });
});

// Upload the image.
app.post('/images', uploads.single('imageField'), function(req, res) {
    Image.create({
        name: req.file.originalname,
        filename: req.file.filename
    }, function(err, item) {
        if (err) {
            return res.status(400).json({
                message: 'Internal Server Error'
            });
        }
        res.status(201).json(item);
    });
});

app.post('/images/:name', function(req, res) {
});

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
