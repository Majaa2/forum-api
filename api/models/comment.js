const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    post: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    _createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model('Comment', commentSchema);