const express = require("express");
const router = express.Router();

//import controllers
const { handleRegister } = require("../controllers/facebookAd");

//post reqs
router.post("/", handleRegister);

module.exports = router;