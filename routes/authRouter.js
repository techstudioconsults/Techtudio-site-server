const express = require("express");
const router = express.Router();
const authentication = require('../middlewares/authentication');

//import controller
const {
  handleRegister,
  handleAdminRegister,
  handleCompleteRegistration,
  handleLogin,
} = require("../controllers/authController");

//post reqs
router.post("/register", handleRegister);
router.post('/register/student', authentication, handleCompleteRegistration);
router.post("/register/admin", handleAdminRegister);
router.post('/login', handleLogin);

module.exports = router;
