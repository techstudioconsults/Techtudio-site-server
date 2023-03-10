const mongoose = require("mongoose");
const { Schema } = mongoose;

const TutorSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  },
  taskAssigned: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Tutor", TutorSchema);
