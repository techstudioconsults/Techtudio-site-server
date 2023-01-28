const mongoose = require('mongoose')
const Profile = require("./profile");
const { Schema } = mongoose

const StudentSchema = new Schema({
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
    },
    schedule: {
        type: String,
        enum: ['weekday', 'weekend'],
        required: true
    },
    newsletter: {
        type: Boolean
    }
})

StudentSchema.pre("save", async function (next) {
    try {
      const existingProfile = await Profile.findOne({ userId: this._id });
      if (!existingProfile) {
        await Profile.create({
          userId: this._id,
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          role: 201,
        });
      } else {
          next()
      }
      next();
    } catch (error) {
      console.log(error);
      next(error)
    }
  });

module.exports = mongoose.model('Student', StudentSchema)