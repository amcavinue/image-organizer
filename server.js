/**
 * Modules
 */
var express = require('express');
var util = require('util');
var mongoose = require('mongoose');
var path = require('path');
var fs = require('fs');
var multer = require('multer');
var uuid = require('uuid');
var bodyParser = require('body-parser');
var _ = require('underscore');
var Image = require('./models/image.js');
var Tag = require('./models/tag.js');
const aws = require('aws-sdk');
const https = require('https');
const fileUpload = require("express-fileupload");
const s3 = require('s3');
const multerS3 = require('multer-s3');
const Upload = require('s3-uploader');
const JSFtp = require('jsftp');
const Client = require('ftp');

var config = require('./config');

var app = express();
app.use(express.static('public'));  // Serve the public folder.
app.use('/scripts', express.static(__dirname + '/node_modules/')); // Serve the node_modules folder.
app.use(bodyParser.json()); // Used for getting parameters in post requests.
// app.use(fileUpload());

// The destination and filenames for uploads.
var storage = multer.diskStorage({ 
    destination: './public/images',
    filename: function(req, file, cb) {
        var filename = uuid.v4() + '-' + file.originalname;
        cb(null, filename);
    }
});
var uploads = multer({ storage: storage });

var credentials = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD
}

/**
 * Routes
 */
app.get('/images', function(req, res) {
    Image.find(true).populate('tags').then(function(docs) { res.json(docs); });
});

app.get('/images/:id', function(req, res) {
    Image.find({_id: req.params.id}).populate('tags').then(function(doc) { res.json(doc); });
});

app.get('/tags', function(req, res) {
    Tag.find(true).then(function(docs) {
        var tags = [];
        docs.forEach(function(item, index) {
            tags.push(item.name);
        });
        res.json(tags);
    });
});

app.get('/images-tags', function(req, res) {
    Image.find(true).populate('tags').then(function(docs) {
        var images = [];
        docs.forEach(function(imageItem, imageIndex) {
            if (imageItem.tags.length === 0) {
                images.push({
                    imageId: imageItem._id,
                    imageName: imageItem.name,
                    tag: null
                });
            } else {
                imageItem.tags.forEach(function(tagItem, tagIndex) {
                    images.push({
                        imageId: imageItem._id,
                        imageName: imageItem.name,
                        tag: tagItem.name
                    });
                });
            }
        });
        res.json(images);
    });
});

// Upload a new image.
app.post('/images', uploads.single('file'), function(req, res) {
    Image.create({
        name: req.file.originalname,
        filename: req.file.filename
    }, function(err, item) {
        if (err) {
            return res.status(400).json({
                message: 'Error while uploading image to MongoDB.'
            });
        }
        
        var ftpClient = new Client();
        ftpClient.connect(credentials);
        ftpClient.on('ready', function() {
           ftpClient.put('./public/images/' + item.filename,
            'image-organizer/' + item.filename,
            function(err) {
                if (err) {
                    console.log(err, 65);
                    return res.status(400).json({
                        message: 'Error while uploading image to server.'
                    });
                }
                console.log('uploaded');
                ftpClient.end();
                ftpClient.destroy();
                return res.status(201).json(item);
            }); 
        });
    });
});

// Update/overwrite an existing image with a new one.
app.put('/images/existing/:id', uploads.single('file'), function(req, res) {
    Image.findOne({_id: req.params.id}, function(err, doc) {
        doc.name = req.file.originalname;
        doc.filename = req.file.filename;
        
        doc.save(function(err, item) {
            if (err) {
                return res.status(400).json({
                    message: 'Error while saving document to MongoDB.'
                });
            }
            
            var ftpClient = new Client();
            ftpClient.connect(credentials);
            ftpClient.on('ready', function() {
               ftpClient.put('./public/images/' + item.filename,
                'image-organizer/' + item.filename,
                function(err) {
                    if (err) {
                        console.log(err, 65);
                        return res.status(400).json({
                            message: 'Error while uploading image to server.'
                        });
                    }
                    console.log('uploaded');
                    ftpClient.end();
                    ftpClient.destroy();
                    return res.status(200).json(item);
                }); 
            });
        });
    });
});

// Update image info and card info.
app.put('/images/:id', function(req, res) {
    Image.findOne({_id: req.params.id}).populate('tags').exec(function(err, doc) {
        function* updateImage() {
            if (err) {
                return res.status(400).json({
                    message: 'Error while accessing MongoDB.'
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
                var imageObj = doc.tags.find(function(tag) {
                    return tag.name === removeRefs[i];
                });
                
                var removeIndex = doc.tags.indexOf(imageObj);
                doc.tags.splice(removeIndex, 1);
                
                // Remove the non-used image reference from the tag.
                yield Tag.findOne({name: removeRefs[i]}, function(err, tagDoc) {
                    var imageIndex = tagDoc.images.indexOf(doc._id);
                    tagDoc.images.splice(imageIndex, 1);
                    tagDoc.save(function(err) {
                        if (err) {
                            return res.status(400).json({
                                message: 'Error while saving document to MongoDB.'
                            });
                        }
                        updateImageIt.next();
                    });
                });
            }
            
            if (addRefs.length !== 0) {
                // Update tag references and add new tags (if applicable).
                yield addRefs.forEach(function(item, index) {
                    Tag.findOne({name: item}).then(function(tagDoc) {
                        if (tagDoc === null) {
                            // If the tag doesn't currently exist, create it.
                            Tag.create({name: item, images: [doc._id]}, function(err, tagDoc2) {
                                if (err) {
                                    return res.status(400).json({
                                        message: 'Error while creating document in MongoDB.'
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
                            doc.tags.push(tagDoc);
                            tagDoc.save(function(err, docSaved, numAffected) {
                                if (err) {
                                    return res.status(400).json({
                                        message: 'Error while saving document in MongoDB.'
                                    });
                                }
                            });
                            if (index === (addRefs.length - 1)) {
                                updateImageIt.next();
                            }
                        }
                    });
                });
            }
            
            // Remove unused tags from the DB.
            yield Tag.find(true, function(err, docs) {
                if (docs) {
                    docs.forEach(function(item, index) {
                        if (item.images.length === 0) {
                            Tag.remove({name: item.name}).exec();
                        }
                    });
                }
                updateImageIt.next();
            });
            
            // Delete old image.
            /*if (req.body.deletePrev) {
                fs.unlinkSync('./public/images/' + req.body.prevFilename);
            }*/
            
            // Save changes the the image doc.
            yield doc.save(function(err, docSaved, numAffected) {
                if (err) {
                    return res.status(400).json({
                        message: 'Error while saving document to MongoDB.'
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
app.delete('/images/:id', function(req, res) {
    Image.findOne({_id: req.params.id}, function(err, doc) {
        function* deleteImage() {
            if (err) {
                return res.status(400).json({
                    message: 'Error while accessing MongoDB.'
                });
            }
            
            if (req.body.rollback) {
                // Delete the newly uploaded, but unused file.
                fs.unlinkSync('./public/images/' + doc.filename);
                
                // Update the document with the old image name & filename.
                doc.filename = req.body.prevFilename;
                doc.name = req.body.prevName;
                
                if (req.body.newImage) {
                    yield Image.remove({_id: req.params.id}, function(err) {
                        if (err) {
                            return res.status(400).json({
                                message: 'Error while removing document from MongoDB.'
                            });
                        }
                        deleteImageIt.next();
                    });
                } else {
                    yield doc.save(function(err, item, numAffected) {
                        if (err) {
                            return res.status(400).json({
                                message: 'Error while saving document to MongoDB.'
                            });
                        }
                        deleteImageIt.next();
                    });
                }
            } else {
                // fs.unlinkSync('./public/images/' + doc.filename);
            
                // Update tag references and remove unused tags.
                yield Tag.find(true).then(function(tags) {
                    if (tags.length !== 0) {
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
                                            message: 'Error while removing document from MongoDB.'
                                        });
                                    }
                                    
                                    if (tagIndex === (tags.length - 1)) {
                                        deleteImageIt.next();
                                    }
                                });
                            } else {
                                tagItem.save(function(err, item, numAffected) {
                                    if (err) {
                                        return res.status(400).json({
                                            message: 'Error while saving document to MongoDB.'
                                        });
                                    }
                                    
                                    if (tagIndex === (tags.length - 1)) {
                                        deleteImageIt.next();
                                    }
                                });
                            }
                        });
                    } else {
                        deleteImageIt.next();
                    }
                });
                
                yield Image.remove({_id: doc._id}, function(err) {
                    if (err) {
                        return res.status(400).json({
                            message: 'Error while removing document from MongoDB.'
                        });
                    }
                    deleteImageIt.next();
                });
            }

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