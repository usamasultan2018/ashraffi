const express = require("express");
const { 
  registerUser, 
  verifyOtp, 
  loginUser, 
  resendOtp, 
  forgotPassword 
} = require("../controllers/AuthController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);

module.exports = router;
