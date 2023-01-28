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
    throw createApiError(422, "Incomplete payload");
  } else {
    // const phone_num = JSON.parse(phoneNumber)
    const spreadSheetId = process.env.SPREADSHEET_ID;
    const doc = new GoogleSpreadsheet(spreadSheetId);

    try {
      await doc.useServiceAccountAuth(creds);
      await doc.getInfo();
      const sheet = doc.sheetsByTitle["Facebook"];
      await sheet.addRow({ firstName, lastName, email, phoneNumber: parseInt(phoneNumber) });
      res.status(201).json(handleResponse("Successfully updated certificate"))
    } catch (error) {
      throw createApiError(500, error.message);
    }
  }
});

module.exports = { handleRegister };
