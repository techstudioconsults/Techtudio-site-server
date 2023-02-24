const mongoose = require("mongoose");
const { Schema } = mongoose;

const AdminSchema = new Schema({
  enrolledStudents: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Admin", AdminSchema);
