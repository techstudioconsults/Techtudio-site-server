const Profile = require('../models/profile')

const {sendContactUsMail, sendOTPToMail} = require('../lib/mailingList')
const { findUser } = require('../lib/findUsers')
const { someEquallyTrue } = require('../lib/payloads')
const {
  handleAsync,
  createApiError,
  handleResponse,
} = require("../utils/helpers");
const { allTrue } = require("../lib/payloads");

const handleContactUs = handleAsync(async (req, res) => {
  const { fullName, email, message } = req.body;

  const payload = allTrue(fullName, email, message);
  if (!payload) throw createApiError("Incomplete Payload", 422);

  const {error} = await sendContactUsMail(fullName, email, message);
  if(error) throw createApiError('email not sent', 500);

  res.status(250).json(handleResponse({ message: "email sent" }));
});

const handleOTP = handleAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) throw createApiError("Incomplete Payload", 422);

  const user = await findUser(email, Profile);
  if (!user) throw createApiError("user not found", 404);

  const { role, _id } = user;
  const roleTest = someEquallyTrue(role, "ADMIN", "STUDENT", "TUTOR");
  if (!roleTest) throw createApiError("unAuthorized user", 401);

  const { error } = await sendOTPToMail(email, _id)
  if(error) throw createApiError('server could not generate otp', 500)

  res
    .status(201)
    .json(handleResponse({ message: "Password change successful" }));
})

module.exports = { handleContactUs, handleOTP };
