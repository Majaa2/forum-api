const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        match: [/\S+@\S+\.\S+/, 'Email is not valid'],
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Password must be at least 8 characters long']
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    ToS: {
        type: Boolean,
        default: false,
        required: true
    }
})

module.exports = mongoose.model('User', userSchema);