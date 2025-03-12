const User = require("../models/User");
const Referral = require("../models/Referral")

const { StatusCodes } = require("http-status-codes");
const MESSAGES = require("../constants/Messages");

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: MESSAGES.AUTH.USER_NOT_FOUND,
            });
        }

        res.status(StatusCodes.OK).json({ user });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
        });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username } = req.body;

        if (!username) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: MESSAGES.VALIDATION.MISSING_FIELDS,
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { username },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: MESSAGES.AUTH.USER_NOT_FOUND,
            });
        }

        res.status(StatusCodes.OK).json({
            message: MESSAGES.SUCCESS.DATA_UPDATED,
            user,
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
        });
    }
};

const deleteUserAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: MESSAGES.AUTH.USER_NOT_FOUND,
            });
        }

        res.status(StatusCodes.OK).json({
            message: MESSAGES.AUTH.ACCOUNT_DELETED,
        });
    } catch (error) {
        console.error("Delete Account Error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
        });
    }
};

const getInvitedUsers = async (req, res) => {
    try{
        const userId = req.user.id;
        const referral = await Referral.findOne({ userId });
        if (!referral) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: MESSAGES.ERROR.RESOURCE_NOT_FOUND });
          }
          const invitedUsers = await User.find({ _id: { $in: referral.usedBy } }).select(
            "_id username email createdAt"
          );
          res.status(StatusCodes.OK).json({
            message: MESSAGES.SUCCESS.DATA_FETCHED,
            invitedUsers,
          });
                    
    }
    catch(error){
        console.error("Fetch Invited Users Error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
        });
    }
}
module.exports = { getUserProfile, updateUserProfile, deleteUserAccount,getInvitedUsers };
