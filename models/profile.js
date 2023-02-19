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
        type: String,
        required: true,
        enum: ['ADMIN', 'STUDENT', 'TUTOR']
    },
    refreshToken: {
        type: [String],
    }
});

module.exports = mongoose.model('Profile', ProfileSchema)