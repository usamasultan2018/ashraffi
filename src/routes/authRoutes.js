const express = require("express");
const { 
  registerUser,
  verifyOtp,
  loginUser,
  resendOtp,
  forgotPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otpp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);

module.exports = router;
