const User = require("../models/User");
const Referral = require("../models/Referral");
const { StatusCodes } = require("http-status-codes");
const cloudinary = require("../config/cloudinary");

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "User not found.",
            });
        }

        res.status(StatusCodes.OK).json({ user });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error.",
        });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        console.log("Uploaded File:", req.file); // Ensure this is not undefined

        const userId = req.user.id;
        const { username } = req.body;
        const file = req.file;

        if (!username && !file) {
            return res.status(400).json({ message: "Username or profile image is required." });
        }

        let imageUrl;
        if (file) {
            const uploadPromise = new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "profiles",
                        public_id: `profile_${userId}`,
                        overwrite: true,
                        transformation: [{ width: 300, height: 300, crop: "fill" }],
                    },
                    (error, result) => {
                        if (error) {
                            console.error("Cloudinary Upload Error:", error);
                            reject(error);
                        } else {
                            resolve(result.secure_url);
                        }
                    }
                );
                stream.end(file.buffer);
            });

            imageUrl = await uploadPromise;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { username, profileImage: imageUrl },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ message: "Profile updated successfully.", user });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};





const deleteUserAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "User not found.",
            });
        }

        res.status(StatusCodes.OK).json({
            message: "User account deleted successfully.",
        });
    } catch (error) {
        console.error("Delete Account Error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error.",
        });
    }
};

const getInvitedUsers = async (req, res) => {
    try {
        const userId = req.user.id;
        const referral = await Referral.findOne({ userId });

        if (!referral) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Referral record not found.",
            });
        }

        const invitedUsers = await User.find({ _id: { $in: referral.usedBy } }).select(
            "_id username email createdAt"
        );

        res.status(StatusCodes.OK).json({
            message: "Invited users fetched successfully.",
            invitedUsers,
        });

    } catch (error) {
        console.error("Fetch Invited Users Error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error.",
        });
    }
};

module.exports = { getUserProfile, updateUserProfile, deleteUserAccount, getInvitedUsers };
