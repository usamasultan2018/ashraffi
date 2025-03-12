const User = require("../models/User");
const Referral = require("../models/Referral")
const {generateToken} = require("../utils/jwtUtils");
const generateOtp = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");
const { StatusCodes } = require("http-status-codes");
const MESSAGES = require("../constants/Messages");

const registerUser = async (req, res) => {
  try {
    const { username, email, password, referredBy } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: MESSAGES.VALIDATION.MISSING_FIELDS });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: MESSAGES.AUTH.USER_ALREADY_EXISTS });
    }

    // Generate OTP and expiry
    const otp = generateOtp();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    // Generate a unique referral code
    let referralCode;
    let isUnique = false;
    while (!isUnique) {
      referralCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // Random 6-character string
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
        return res.status(400).json({ message: MESSAGES.VALIDATION.INVALID_REFERRAL });
      }
      referrer = referrerRecord.userId; // Store referrer's userId
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      otp,
      otpExpiry,
      referralCode,
      referredBy: referrer, // Stores the referrer’s user ID
    });

    await newUser.save();

    // Store the referral code in the Referral collection
    const newReferral = new Referral({
      code: referralCode,
      userId: newUser._id,
    });

    await newReferral.save();

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
      message: MESSAGES.SUCCESS.OTP_SENT,
      userId: newUser._id,
      referralCode,
      referredBy: referredBy || null,
    });
  } catch (error) {
      console.error("Registration Error:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  };
  
  const verifyOtp = async (req, res) => {
    try {
      const { email, otp } = req.body;
  
      if (!email || !otp) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: MESSAGES.VALIDATION.MISSING_FIELDS,
        });
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: MESSAGES.AUTH.USER_NOT_FOUND,
        });
      }
  
      if (user.otp !== otp || user.otpExpiry < Date.now()) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: MESSAGES.OTP.INVALID_OTP,
        });
      }
  
      user.isVerified = true;
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
  
      res.status(StatusCodes.OK).json({
        message: MESSAGES.AUTH.VERIFICATION_SUCCESS,
      });
    } catch (error) {
      console.error("OTP Verification Error:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  };
  

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: MESSAGES.VALIDATION.MISSING_FIELDS,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    if (!user.isVerified) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: MESSAGES.AUTH.ACCOUNT_NOT_VERIFIED,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: MESSAGES.AUTH.INVALID_CREDENTIALS,
      });
    }

    res.status(StatusCodes.OK).json({
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
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
      message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: MESSAGES.VALIDATION.MISSING_FIELDS,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    if (user.isVerified) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: MESSAGES.AUTH.ALREADY_VERIFIED,
      });
    }

    user.otp = generateOtp();
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendEmail(email, "Resend OTP", `Your OTP is: ${user.otp}`);

    res.status(StatusCodes.OK).json({
      message: MESSAGES.AUTH.OTP_SENT,
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: MESSAGES.VALIDATION.MISSING_FIELDS,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    const resetToken = generateToken(user._id);
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    await sendEmail(email, "Reset Your Password", `Click here to reset your password: ${resetLink}`);

    res.status(StatusCodes.OK).json({
        message: MESSAGES.AUTH.RESET_LINK_SENT,
        resetToken,
      });
      
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};



module.exports = {
  registerUser,
  verifyOtp,
  loginUser,
  resendOtp,
  forgotPassword,
};
