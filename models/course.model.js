const mongoose = require("mongoose");
const { Schema } = mongoose;

const CourseSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  tutors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
    },
  ],
  resources: [String],
});

module.exports = mongoose.model("Course", CourseSchema);
