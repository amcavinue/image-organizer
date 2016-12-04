var mongoose = require('mongoose');

var TagSchema = new mongoose.Schema({
    name: {type: String, required: true},
    images: [{type: mongoose.Schema.Types.ObjectId, ref: 'Image'}]
});

var Tag = mongoose.model('Tag', TagSchema);

module.exports = Tag;
