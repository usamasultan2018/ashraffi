const express = require("express");
const { 
  getUserProfile, 
  updateUserProfile, 
  deleteUserAccount, 
  getInvitedUsers
} = require("../controllers/UserController");
const upload = require("../middlewares/upload"); // Import multer config

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile",authMiddleware, upload.single("profileImage"), updateUserProfile);
router.delete("/account", authMiddleware, deleteUserAccount);
router.get("/invited-users", authMiddleware, getInvitedUsers);

module.exports = router;
