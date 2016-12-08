global.DATABASE_URL = 'mongodb://localhost/image-organizer-test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server.js');
var fs = require('fs');
var Image = require('../models/image.js');
var Tag = require('../models/tag.js');

var should = chai.should();
var expect = chai.expect;

var app = server.app;

chai.use(chaiHttp);

describe('Image organizer', function() {
    var ghiId, tsrId, abcId, defId, testImageId;
    
    before(function(done) {
        server.runServer(function() {
            Tag.create({name:'ghi'}, function(err, doc) {
                ghiId = doc._id;
                
                Image.create({name: 'zyx'}, {name: 'wvu'});
                Image.create({name: 'tsr', tags:[ghiId]}, function(err, doc) {
                    Tag.update({name: 'ghi'}, {images: [doc._id]}).exec(function(err, doc) {
                        tsrId = doc._id;
                        done();
                    });
                });
            });
        });
    });

    it('should show the app root', function(done) {
        chai.request(app)
            .get('/')
            .end(function(err, res) {
                res.should.have.status(200);
                done();
            });
    });
    
    it('should return the images data with tags', function(done) {
        chai.request(app)
            .get('/images')
            .end(function(err, res) {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body[res.body.length-1].should.be.a('object');
                expect(res.body[res.body.length-1].tags).to.have.length.of(1);
                done();
            });
    });
    
    it('should return data for a single image', function(done) {
        chai.request(app)
            .get('/images/tsr')
            .end(function(err, res) {
                res.should.have.status(200);
                res.body.should.be.a('array');
                expect(res.body[0].name).to.equal('tsr');
                expect(res.body[0].tags).to.have.length.of(1);
                done();
            });
    });
    
    it('should upload an image file', function(done) {
        chai.request(app)
            .post('/images')
            .set('Content-type', 'multipart/form-data')
            .attach('imageField', fs.readFileSync('./test/test-image.jpg'), './test/test-image.jpg')
            .end(function(err, res) {
                res.should.have.status(201);
                chai.request(app)
                    .get('/images/test-image.jpg')
                    .end(function(err, res) {
                        res.should.have.status(200);
                        res.body.should.be.a('array');
                        expect(res.body[0].name).to.equal('test-image.jpg');
                        expect(fs.existsSync('./public/images/' + res.body[0].filename)).to.be.true;
                        done();
                    });
            });
    });
    
    it('should update an existing image with a new one', function(done) {
        chai.request(app)
            .put('/images/existing/test-image.jpg')
            .set('Content-type', 'multipart/form-data')
            .attach('imageField', fs.readFileSync('./test/test-image.jpg'), './test/test-image.jpg')
            .end(function(err, res) {
                res.should.have.status(204);
                done();
            });
    });
    
    it('should update the data for the test-image.jpg', function(done) {
        chai.request(app)
            .put('/images/test-image.jpg')
            .send({ tags: ['abc', 'def']})
            .end(function(err, res) {
                testImageId = res.body._id;
                res.should.have.status(200);
                expect(res.body.tags.indexOf('abc')).to.be.ok;
                expect(res.body.tags.indexOf('def')).to.be.ok;
                done();
            });
    });
    
    it('should update a single image data', function(done) {
        chai.request(app)
            .put('/images/tsr')
            .send({ description: 'abc', tags: ['abc', 'def']})
            .end(function(err, res) {
                res.should.have.status(200);
                expect(res.body.tags.indexOf('abc')).to.be.ok;
                expect(res.body.tags.indexOf('def')).to.be.ok;
                done();
            });
    });
    
    describe('references should be changed after image update', function() {
        it('ghi tag should have been removed due to no references.', function(done) {
            Tag.findOne({name: 'ghi'}, function(err, doc) {
                expect(doc).to.not.be.ok;
                done();
            });
        });
        
        it('abc and def tags should have been created.', function(done) {
            Tag.findOne({name: 'abc'}, function(err, doc) {
                if (doc) {
                    Tag.findOne({name: 'def'}, function(err, doc) {
                        if (doc) {
                            done();
                        }
                    });
                }
            });
        });
        
        it('abc tag should have reference to tsr image.', function(done) {
            Tag.findOne({name: 'abc'}, function(err, doc) {
                var tsrIndex = doc.images.indexOf(tsrId);
                if (tsrIndex) {
                    done();
                }
            });
        });
        
        it('def tag should have reference to tsr image.', function(done) {
            Tag.findOne({name: 'def'}, function(err, doc) {
                var tsrIndex = doc.images.indexOf(tsrId);
                if (tsrIndex) {
                    done();
                }
            });
        });
    });
    
    it('should delete an image and its data', function(done) {
        chai.request(app)
            .delete('/images/test-image.jpg')
            .end(function(err, res) {
                res.should.have.status(204);
                
                // abc and def tags should not have references to test-image.jpg. 
                Tag.findOne({name: 'abc'}, function(err, doc) {
                    doc.images.forEach(function(item, index) {
                        expect(String(item)).to.not.equal(testImageId);
                    });
                });
                
                Tag.findOne({name: 'def'}, function(err, doc) {
                    doc.images.forEach(function(item, index) {
                        expect(String(item)).to.not.equal(testImageId);
                    });
                    done();
                });
            });
    });
    
    after(function(done) {
        Tag.findOneAndRemove({name: 'abc'}).exec();
        Tag.findOneAndRemove({name: 'def'}).exec();
        Tag.findOneAndRemove({name: 'ghi'}).exec();
        
        Image.findOneAndRemove({name: 'zyx'}).exec();
        Image.findOneAndRemove({name: 'wvu'}).exec();
        Image.findOneAndRemove({name: 'tsr'}).exec(function(err, doc) {
            if (err) {
                console.log(err);
            }
            done();
        });
    });
});
