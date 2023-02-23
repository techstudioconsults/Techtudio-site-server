const express = require("express");
const router = express.Router();

const {
  handleContactUs,
  handleOTP,
} = require("../controllers/mailingController");

router.post("/contactUs", handleContactUs);
router.post("/otp", handleOTP);

module.exports = router;
