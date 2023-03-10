const mongoose = require("mongoose");
const { Schema } = mongoose;

const Admin = require("./admin.model");
const Tutor = require("./tutor.model");
const Student = require("./student.model");

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
  avatar: {
    type: String
  },
  refreshToken: {
    type: [String],
    default: []
  },
});

ProfileSchema.pre("save", async function (next) {
  try {
    if (this.role === "ADMIN") {
      const user = await Admin.findOne({userId: this._id});
      if (!user) {
        await Admin.create({
          userId: this._id,
        });
      }
    } else if (this.role === "STUDENT") {
      const user = await Student.findOne({userId: this._id});
      if (!user) {
        await Student.create({
          userId: this._id,
        });
      }
    } else if (this.role === "TUTOR") {
      const user = await Tutor.findOne({userId: this._id});
      if (!user) {
        await Tutor.create({
          userId: this._id,
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
