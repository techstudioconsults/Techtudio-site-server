const express = require("express");
const router = express.Router();

const { handleContactUs } = require('../controllers/mailingController')

router.post('/contactUs', handleContactUs)

module.exports = router;