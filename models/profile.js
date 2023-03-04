const mongoose = require("mongoose");
const { Schema } = mongoose;

const Admin = require("./admin");
const Tutor = require("./TutorModel");
const Student = require("./studentModel");

const ProfileSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["ADMIN", "STUDENT", "TUTOR"],
  },
  refreshToken: {
    type: [String],
  },
});

ProfileSchema.pre("save", async function (next) {
  try {
    if (this.role === "ADMIN") {
      const user = await Admin.findById(this._id);
      if (!user) {
        await Admin.create({
          _id: this._id,
        });
      }
    } else if (this.role === "STUDENT") {
      const user = await Student.findById(this._id);
      if (!user) {
        await Student.create({
          _id: this._id,
        });
      }
    } else if (this.role === "TUTOR") {
      const user = await Tutor.findById(this._id);
      if (!user) {
        await Tutor.create({
          _id: this._id,
        });
      }
    } else {
      throw Error("user validation required");
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Profile", ProfileSchema);
