const User = require("../models/User");
const Referral = require("../models/Referral");
const { generateToken } = require("../utils/jwtUtils");
const generateOtp = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");
const { StatusCodes } = require("http-status-codes");

const registerUser = async (req, res) => {
  try {
    const { username, email, password, referredBy } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Generate OTP and expiry
    const otp = generateOtp();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    // Generate a unique referral code
    let referralCode;
    let isUnique = false;
    while (!isUnique) {
      referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingReferral = await Referral.findOne({ code: referralCode });
      if (!existingReferral) {
        isUnique = true;
      }
    }

    // Handle Referral Code Usage
    let referrer = null;
    if (referredBy) {
      const referrerRecord = await Referral.findOne({ code: referredBy });
      if (!referrerRecord) {
        return res.status(400).json({ message: "Invalid referral code" });
      }
      referrer = referrerRecord.userId;
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      otp,
      otpExpiry,
      referralCode,
      referredBy: referrer,
    });

    await newUser.save();

    // Store the referral code in the Referral collection
    await new Referral({ code: referralCode, userId: newUser._id }).save();

    // If referred by someone, update their referral record
    if (referredBy) {
      await Referral.findOneAndUpdate(
        { code: referredBy },
        { $push: { usedBy: newUser._id } }
      );
    }

    // Send OTP email
    await sendEmail(email, otp);

    return res.status(201).json({
      message: "OTP sent successfully",
      userId: newUser._id,
      referralCode,
      referredBy: referredBy || null,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Missing required fields",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "User not found",
      });
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid or expired OTP",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(StatusCodes.OK).json({
      message: "Verification successful",
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Missing required fields",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Account not verified",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid credentials",
      });
    }

    res.status(StatusCodes.OK).json({
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Missing required fields",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "User is already verified",
      });
    }

    user.otp = generateOtp();
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendEmail(email, "Resend OTP", `Your OTP is: ${user.otp}`);

    res.status(StatusCodes.OK).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "User not found",
      });
    }

    // Generate a simple random token (16-character alphanumeric)
    const resetToken = Math.random().toString(36).slice(2, 18);  
    const resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour

    // Store reset token in the database
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Generate reset password link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send reset email
    await sendEmail(email, "Reset Your Password", `Click here to reset your password: ${resetLink}`);

    res.status(StatusCodes.OK).json({
      message: "Reset link sent successfully",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};



const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Token and new password are required." });
    }

    // Find user by reset token and check if it's still valid
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // Ensure token is not expired
    });

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid or expired reset token." });
    }

    // Update password (it will be hashed automatically in the `pre("save")` middleware)
    user.password = newPassword;

    // Clear reset token fields
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    res.status(StatusCodes.OK).json({ message: "Password has been reset successfully!" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};


module.exports = {
  resetPassword,
  registerUser,
  verifyOtp,
  loginUser,
  resendOtp,
  forgotPassword,
};
