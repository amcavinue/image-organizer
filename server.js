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

// Upload a new image.
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

// Update/overwrite an existing image with a new one.
app.put('/images/existing/:name', uploads.single('imageField'), function(req, res) {
    Image.findOne({name: req.params.name}, function(err, doc) {
        fs.unlinkSync('./public/images/' + doc.filename);
        
        doc.name = req.file.originalname;
        doc.filename = req.file.filename;
        
        doc.save(function(err, item) {
            if (err) {
                return res.status(400).json({
                    message: 'Internal Server Error'
                });
            }
            res.status(204).end();
        });
    });
});

// Update image info and card info.
app.put('/images/:name', function(req, res) {
    Image.findOne({name: req.params.name}).populate('tags').exec(function(err, doc) {
        function* updateImage() {
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
                doc.tags.splice(removeIndex, 1);
                
                // Remove the non-used image reference from the tag.
                yield Tag.findOne({name: removeRefs[i]}, function(err, tagDoc) {
                    var imageIndex = tagDoc.images.indexOf(doc._id);
                    tagDoc.images.splice(imageIndex, 1);
                    tagDoc.save(function(err) {
                        if (err) {
                            return res.status(400).json({
                                message: 'Internal Server Error'
                            });
                        }
                        updateImageIt.next();
                    });
                });
            }
            
            // Update tag references and add new tags (if applicable).
            yield addRefs.forEach(function(item, index) {
                Tag.findOne({name: item}).then(function(tagDoc) {
                    if (tagDoc === null) {
                        // If the tag doesn't currently exist, create it.
                        Tag.create({name: item, images: [doc._id]}, function(err, tagDoc2) {
                            if (err) {
                                return res.status(400).json({
                                    message: 'Internal Server Error'
                                });
                            }
                            // Add the new tag reference to the image doc.
                            doc.tags.push(tagDoc2);
                            
                            if (index === (addRefs.length - 1)) {
                                updateImageIt.next();
                            }
                        });
                    } else {
                        // Add the tag reference to the image doc.
                        tagDoc.images.push(doc);
                        tagDoc.save(function(err, docSaved, numAffected) {
                            if (err) {
                                return res.status(400).json({
                                    message: 'Internal Server Error'
                                });
                            }
                            doc.tags.push(tagDoc);
                            
                            if (index === (addRefs.length - 1)) {
                                updateImageIt.next();
                            }
                        });
                    }
                });
            });
            
            // Remove unused tags from the DB.
            yield Tag.find(true).then(function(docs) {
               docs.forEach(function(item, index) {
                   if (item.images.length === 0) {
                       Tag.remove({name: item.name}).exec();
                   }
               });
               updateImageIt.next();
            });
            
            // Save changes the the image doc.
            yield doc.save(function(err, docSaved, numAffected) {
                if (err) {
                    return res.status(400).json({
                        message: 'Internal Server Error'
                    });
                }
                res.status(200).send(docSaved);
            });
        }
        var updateImageIt = updateImage();
        updateImageIt.next();
    });
});

// Delete the image file and data.
app.delete('/images/:name', function(req, res) {
    Image.findOne({name: req.params.name}, function(err, doc) {
        function* deleteImage() {
            if (err) {
                return res.status(400).json({
                    message: 'Internal Server Error'
                });
            }
            
            fs.unlinkSync('./public/images/' + doc.filename);
            
            // Update tag references and remove unused tags.
            yield Tag.find(true).then(function(tags) {
                // Go through each tag and look for a reference to the image.
                tags.forEach(function(tagItem, tagIndex) {
                    var imageRefsRem = [];
                    tagItem.images.forEach(function(imageItem, imageIndex) {
                        if(String(imageItem) === String(doc._id)) {
                            imageRefsRem.push(imageIndex)
                        }
                    });
                    imageRefsRem.forEach(function(item, index) {
                        tagItem.images.splice(item, 1);
                    });
                
                    // Save all the tags or delete them if they have no more references.
                    if(tagItem.images.length === 0) {
                        Tag.remove({_id: tagItem._id}, function(err) {
                            if (err) {
                                return res.status(400).json({
                                    message: 'Internal Server Error'
                                });
                            }
                            
                            if (index === (tags.length - 1)) {
                                deleteImageIt.next();
                            }
                        });
                    } else {
                        tagItem.save(function(err, item, numAffected) {
                            if (err) {
                                return res.status(400).json({
                                    message: 'Internal Server Error'
                                });
                            }
                            
                            if (tagIndex === (tags.length - 1)) {
                                deleteImageIt.next();
                            }
                        });
                    }
                });
            });
            
            yield Image.remove({_id: doc._id}, function(err) {
                if (err) {
                    return res.status(400).json({
                        message: 'Internal Server Error'
                    });
                }
                deleteImageIt.next();
            });
            
            yield res.status(204).end();
        }
        var deleteImageIt = deleteImage();
        deleteImageIt.next();
    });
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
