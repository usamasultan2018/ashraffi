const express = require("express");
const { 
  registerUser,
  verifyOtp,
  loginUser,
  resendOtp,
  forgotPassword,
  resetPassword, 
} = require("../controllers/authenticationController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword); 

module.exports = router;
