const { StatusCodes } = require("http-status-codes");
const MESSAGES = require("../constants/Messages");
const { verifyToken } = require("../utils/jwtUtils");


const authMiddleware = async (req, res, next) => {
    try {
        // extract token from the request headers

        const token = req.headers.authorization?.split(" ")[1]; // Extract token

        // If no token is provided, return Unauthorized error
        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: MESSAGES.AUTH.UNAUTHORIZED_ACCESS,
            });
        }
        const decoded = verifyToken(token);
        req.user = decoded;

        next();

    }
    catch (error) {
        console.error("Auth Middleware Error:", error);

        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: MESSAGES.AUTH.INVALID_TOKEN,
        });
    }

};
module.exports = authMiddleware;
