const mongoose = require("mongoose");
const { Schema } = mongoose;

const TutorSchema = new Schema({
  taskAssigned: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Tutor", TutorSchema);
