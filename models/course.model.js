const mongoose = require("mongoose");
const { Schema } = mongoose;


const resourceSchema = new Schema({
  audio: [String],
  pdf: [String],
  video: [String]
});

const CourseSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: Number,
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
  resources: resourceSchema,
}, {timestamps: true});


module.exports = mongoose.model("Course", CourseSchema);
