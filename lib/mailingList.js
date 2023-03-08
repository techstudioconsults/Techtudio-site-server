const bcrypt = require("bcryptjs");
const UserOTP = require("../models/otp.model");

const { generateRandomNum, addHours } = require("./mathHelpers");
let { verifyTransPorter, sendMail } = require("../utils/mailing");

const sendContactUsMail = async (fullName, email, message) => {
  const verify = await verifyTransPorter();
  if (verify) {
    //mail options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: "tobiolanitori@gmail.com",
      subject: "Training Programs",
      template: "contactUs",
      context: { fullName, message, email },
    };

    try {
      await sendMail(mailOptions);
      return { error: false };
    } catch (error) {
      return { error: true };
    }
  } else {
    return { error: true };
  }
};

const sendOTPToMail = async (email, id) => {
  const verify = await verifyTransPorter();

  if (verify) {
    //generate random 4 digits
    const otp = generateRandomNum();

    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the sign up</p>
      <p>This code <b>expires in 1hr</b></p>`,
    };

    try {
      //hash the generated digits
      const hashedOTP = await bcrypt.hash(otp, 10);
      const payload = {
        otp: hashedOTP,
        createdAt: Date.now(),
        expiresAT: addHours(1),
      };

      //save otp in db so it can be verified
      const userOTPinDb = await UserOTP.findById(id);
      if (!userOTPinDb) {
        const saveOTP = new UserOTP({
          _id: id,
          otps: [payload],
        });
        await saveOTP.save();
      } else {
        userOTPinDb.otps = [...userOTPinDb.otps, payload];
        await userOTPinDb.save();
      }
      //send otp to email
      await sendMail(mailOptions);
      return { error: false };
    } catch (error) {
      console.log(error);
      return { error: true, message: error.message };
    }
  } else {
    return { error: true, message: "transporter is down" };
  }
};

module.exports = { sendContactUsMail, sendOTPToMail };
