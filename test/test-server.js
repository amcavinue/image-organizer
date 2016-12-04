global.DATABASE_URL = 'mongodb://localhost/image-organizer-test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server.js');
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
        // this.timeout(7000);
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
    
    after(function(done) {
        Image.findOneAndRemove({name: 'zyx'}).exec();
        Image.findOneAndRemove({name: 'wvu'}, function(error, doc, result) {
            done();
        });
    });
});
