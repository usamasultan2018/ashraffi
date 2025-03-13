const { StatusCodes } = require("http-status-codes");
const { verifyToken } = require("../utils/jwtUtils");

const authMiddleware = async (req, res, next) => {
    try {
        // Extract token from the request headers
        const token = req.headers.authorization?.split(" ")[1];

        // If no token is provided, return Unauthorized error
        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Unauthorized access",
            });
        }

        const decoded = verifyToken(token);
        req.user = decoded;

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);

        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "Invalid token",
        });
    }
};

module.exports = authMiddleware;
