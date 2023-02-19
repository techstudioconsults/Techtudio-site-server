const {sendContactUsMail} = require('../lib/mailingList')
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

module.exports = { handleContactUs };
