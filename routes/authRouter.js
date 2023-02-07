const express = require("express");
const router = express.Router();
const authentication = require('../middlewares/authentication');

//import controller
const {
  handleAdminRegister,
  handleStudentRegister,
  handleUserSignUp,
  handleLogin,
} = require("../controllers/authController");

//post reqs
router.post("/signup", authentication, handleUserSignUp);
router.post('/register', handleStudentRegister);
router.post("/register/admin", handleAdminRegister);
router.post('/login', handleLogin);

module.exports = router;
