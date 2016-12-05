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
    before(function(done) {
        server.runServer(function() {
            Tag.create({name:'zyx'}, function(err, doc) {
                var zyxId = doc._id;
                
                Image.create({name: 'zyx'}, {name: 'wvu'}, {name: 'tsr', tags:[zyxId]}, function() {
                    done();
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
                        done();
                    });
            });
    });
    
    after(function(done) {
        Tag.findOneAndRemove({name: 'zyx'}).exec();
        Image.findOneAndRemove({name: 'test-image.jpg'}).exec();
        Image.findOneAndRemove({name: 'zyx'}).exec();
        Image.findOneAndRemove({name: 'wvu'}).exec();
        Image.findOneAndRemove({name: 'tsr'}, function(error, doc, result) {
            done();
        });
    });
});
