const mongoose = require("mongoose");
const { Schema } = mongoose;

const AdminSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  },
  enrolledStudents: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Admin", AdminSchema);
