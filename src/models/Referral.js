const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // ✅ Index for faster lookups
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    usedBy: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [] } 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Referral", referralSchema);
