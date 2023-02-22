let { verifyTransPorter, sendMail } = require("../utils/mailing");

const sendContactUsMail = async (fullName, email, message) => {
  const verify = await verifyTransPorter();
  if (verify) {
    //mail options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: "kinxly@gmail.com",
      subject: "Training Programs",
      template: "contactUs",
      context: { fullName, message, email },
    };
    await sendMail(mailOptions);
    return { error: false };
  } else {
    return { error: true };
  }
};

module.exports = { sendContactUsMail };
