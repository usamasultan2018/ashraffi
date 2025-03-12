const express = require("express");
const { 
  getUserProfile, 
  updateUserProfile, 
  deleteUserAccount, 
  getInvitedUsers
} = require("../controllers/UserController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.delete("/account", authMiddleware, deleteUserAccount);
router.get("/invited-users", authMiddleware, getInvitedUsers);

module.exports = router;
