var mongoose = require('mongoose');

var ImageSchema = new mongoose.Schema({
    description: {type: String, require: false},
    name: {type: String, require: true},
    tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
});

var Image = mongoose.model('Image', ImageSchema);

module.exports = Image;
