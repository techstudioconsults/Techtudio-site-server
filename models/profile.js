const mongoose = require('mongoose')
const { Schema } = mongoose

const ProfileSchema = new Schema({
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
    schedule: {
        type: String,
        enum: ['weekday', 'weekend'],
        required: true
    },
    email: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    newsletter: {
        type: Boolean
    }

});

module.exports = mongoose.model('Profile', ProfileSchema)