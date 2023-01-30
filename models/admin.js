const mongoose = require("mongoose");
const Profile = require("./profile");
const { Schema } = mongoose;

const AdminSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
});

AdminSchema.pre("save", async function (next) {
  try {
    const existingProfile = await Profile.findOne({ userId: this._id });
    if (!existingProfile) {
      await Profile.create({
        userId: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phoneNumber: this.phoneNumber,
        role: 101,
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

module.exports = mongoose.model('Admin', AdminSchema)