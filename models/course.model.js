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
    unique: true
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    online: { type: Number, required: true },
    weekend: { type: Number, required: true },
    weekday: { type: Number, required: true }
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
