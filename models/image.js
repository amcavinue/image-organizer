var mongoose = require('mongoose');

var ImageSchema = new mongoose.Schema({
    description: {type: String},
    name: {type: String, require: true},
    filename: {type: String},
    tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
});

var Image = mongoose.model('Image', ImageSchema);

module.exports = Image;
