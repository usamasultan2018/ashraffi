const User = require("../models/User");
const Referral = require("../models/Referral");
const { StatusCodes } = require("http-status-codes");

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
        const userId = req.user.id;
        const { username } = req.body;

        if (!username) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Username is required.",
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { username },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "User not found.",
            });
        }

        res.status(StatusCodes.OK).json({
            message: "User profile updated successfully.",
            user,
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error.",
        });
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
