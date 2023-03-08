const mongoose = require("mongoose");

const UserOTPSchema = new mongoose.Schema({
  otps: [
    {
      otp: {
        type: String,
        required: true,
      },
      createdAt: Date,
      expiresAT: Date,
    },
  ],
});

module.exports = mongoose.model("UserOTP", UserOTPSchema);
