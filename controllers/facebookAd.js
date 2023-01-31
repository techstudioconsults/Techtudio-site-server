const {
  handleAsync,
  createApiError,
  handleResponse,
} = require("../utils/helpers");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("../client_secret.json");

const handleRegister = handleAsync(async (req, res) => {
  const { firstName, lastName, email, phoneNumber } = req.body;

  if (!firstName || !lastName || !email || !phoneNumber) {
    throw createApiError("Incomplete payload", 422);
  } else {
    const spreadSheetId = process.env.SPREADSHEET_ID;
    const doc = new GoogleSpreadsheet(spreadSheetId);

    try {
      await doc.useServiceAccountAuth(creds);
      await doc.getInfo();
      const sheet = doc.sheetsByTitle["Facebook"];
      await sheet.addRow({ firstName, lastName, email, phoneNumber: parseInt(phoneNumber) });
      res.status(201).json(handleResponse("Successful Registration"))
    } catch (error) {
      throw createApiError(error.message, 500);
    }
  }
});

module.exports = { handleRegister };
