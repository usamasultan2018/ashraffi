const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true }, 
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: null }, // ✅ Profile Image URL
    otp: { type: String }, 
    otpExpires: { type: Date }, 
    isVerified: { type: Boolean, default: false }, 
    referralCode: { type: String, unique: true }, 
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // ✅ Store User ID
    resetToken: { type: String, default: null }, // ✅ Token for password reset
    resetTokenExpiry: { type: Date, default: null }, // ✅ Expiry time for reset token
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Check if OTP is valid
userSchema.methods.isOtpValid = function (enteredOtp) {
  return this.otp === enteredOtp && this.otpExpires > Date.now();
};

// Check if reset token is valid
userSchema.methods.isResetTokenValid = function (token) {
  return this.resetToken === token && this.resetTokenExpiry > Date.now();
};

module.exports = mongoose.model("User", userSchema);
