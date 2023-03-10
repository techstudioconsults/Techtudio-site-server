const mongoose = require("mongoose");
const { Schema } = mongoose;

const ClassSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Course",
  },
  classType: {
    type: String,
    required: true,
    enum: ['online', 'weekday', 'weekend']
  },
});

module.exports = mongoose.model("Class", ClassSchema);
