const mongoose = require("mongoose");
const { Schema } = mongoose;

const StudentSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  },
  schedule: {
    type: String,
    enum: ["weekday", "weekend"],
  },
  course: {
    type: String,
    enum: ["ui/ux", "graphics", "android", "frontend", "backend"],
  },
  newsletter: {
    type: Boolean,
  },
});

module.exports = mongoose.model("Student", StudentSchema);
