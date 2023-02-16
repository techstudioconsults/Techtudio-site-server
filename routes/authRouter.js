const express = require("express");
const router = express.Router();
const authentication = require('../middlewares/authentication');

//import controller
const {
  handleAdminRegister,
  handleStudentRegister,
  handleUserSignUp,
  handleLogin,
  testEndpoint
} = require("../controllers/authController");

//post reqs
router.post('/register', handleStudentRegister);
router.post("/register/admin", handleAdminRegister);
router.post('/login', handleLogin);

router.post('/signup', authentication, handleUserSignUp )

router.get('/signup', testEndpoint)

module.exports = router;
