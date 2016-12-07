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
var bodyParser = require('body-parser');
var _ = require('underscore');
var Image = require('./models/image.js');
var Tag = require('./models/tag.js');

var app = express();
app.use(express.static('public'));  // Serve the public folder.
app.use('/scripts', express.static(__dirname + '/node_modules/')); // Serve the node_modules folder.
app.use(bodyParser.json()); // Used for getting parameters in post requests.

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

app.put('/images/:name', function(req, res) {
    function* update() {
        var tags = [];
    
        yield Tag.find(true).then(function(docs) {
            // Get just the tagnames from the object.
            for (var i = 0; i < docs.length; i++) {
                tags.push(docs[i].name);
            }
            updateI.next();
        });
        
        yield Image.findOne({name: req.params.name}).populate('tags').exec(function(err, doc) {
            if (err) {
                return res.status(400).json({
                    message: 'Internal Server Error'
                });
            }
            
            doc.description = req.body.description;
            
            // Get just the names of the tags.
            var imageTags = [];
            for (var i = 0; i < doc.tags.length; i++) {
                imageTags.push(doc.tags[i].name);
            }
            
            // Determine what references need to be changed.
            var removeRefs = _.difference(imageTags, req.body.tags);
            var addRefs = _.difference(req.body.tags, imageTags);
            
            for (var i = 0; i < removeRefs.length; i++) {
                // Remove the existing reference from the image doc.
                var removeIndex = doc.tags.indexOf(removeRefs[i]);
                doc.tags = doc.tags.splice(removeIndex, 1);
                
                // Remove the non-used image reference from the tag.
                Tag.findOne({name: removeRefs[i]}).then(function(tagDoc) {
                    var imageIndex = tagDoc.images.indexOf(doc._id)
                    tagDoc.image.splice(imageIndex, 1);
                    tagDoc.save();
                });
            }
            
            addRefs.forEach(function(item, index) {
                Tag.findOne({name: item}).then(function(tagDoc) {
                    if (tagDoc === null) {
                        // If the tag doesn't currently exist, create it.
                        Tag.create({name: item, images: [doc._id]}, function(err, tagDoc2) {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    message: 'Internal Server Error'
                                });
                            }
                            
                            // Add the new tag reference to the image doc.
                            doc.tags.push(tagDoc2._id);
                            
                            doc.save(function(err) {
                                if (err) {
                                    return res.status(400).json({
                                        message: 'Internal Server Error'
                                    });
                                }
                                res.status(204).end();
                            });
                        });
                    } else {
                        // Add the new tag reference to the image doc.
                        doc.tags.push(tagDoc._id);
                        
                        doc.save(function(err) {
                            if (err) {
                                return res.status(400).json({
                                    message: 'Internal Server Error'
                                });
                            }
                            res.status(204).end();
                        });
                    }
                });
            });
        });
    }
    
    var updateI = update();
    updateI.next();
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
