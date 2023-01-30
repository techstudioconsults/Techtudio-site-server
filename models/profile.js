const mongoose = require('mongoose')
const { Schema } = mongoose

const ProfileSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'role'
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        required: true,
        enum: [101, 201, 301]
    }
});

module.exports = mongoose.model('Profile', ProfileSchema)