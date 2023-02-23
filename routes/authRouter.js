const express = require("express");
const router = express.Router();
const authentication = require('../middlewares/authentication');

//import controller
const {
  handleAdminRegister,
  handleStudentRegister,
  handleUserSignUp,
  handleLogin,
  handleRefreshToken,
  handleLogout,
  handleChangePassword,
  handleForgotPassword,
  testEndpoint
} = require("../controllers/authController");

//post reqs
router.post('/register', handleStudentRegister);
router.post("/register/admin", handleAdminRegister);
router.post('/login', handleLogin);
router.post('/signup', authentication, handleUserSignUp )
router.post('/token', handleRefreshToken)
router.delete('/logout', authentication, handleLogout)
router.patch('/change-password', authentication, handleChangePassword)
router.patch('/forgot-password', handleForgotPassword)

router.get('/test', authentication, testEndpoint)

module.exports = router;
