const MESSAGES = {
    // ✅ Authentication & User Management
    AUTH: {
        USER_ALREADY_EXISTS: "A user with this email already exists.",
        USER_NOT_FOUND: "No user found with this email.",
        INVALID_CREDENTIALS: "Incorrect email or password. Please try again.",
        REGISTRATION_SUCCESS: "Registration successful! You can now log in.",
        LOGIN_SUCCESS: "Login successful. Welcome back!",
        LOGOUT_SUCCESS: "You have been logged out successfully.",
        ACCOUNT_NOT_VERIFIED: "Your account is not verified. Please verify your email.",
        ACCOUNT_DELETED: "Your account has been deleted successfully.",  // ✅ Added this
        OTP_SENT: "OTP has been sent to your email.",
        INVALID_OTP: "Invalid or expired OTP. Please try again.",
        VERIFICATION_SUCCESS: "Account verified successfully.",
        OTP_RESENT: "OTP has been sent to your email.",
    },

    // ✅ Validation Messages
    VALIDATION: {
        MISSING_FIELDS: "All required fields must be filled.",
        INVALID_EMAIL_FORMAT: "Please provide a valid email address.",
        WEAK_PASSWORD: "Password must be at least 6 characters long.",
        PASSWORDS_NOT_MATCH: "Passwords do not match.",
        INVALID_INPUT: "Invalid input. Please check your data.",
        INVALID_REFERRAL: "Invalid referral code",
    },

    // ✅ Authorization & Access Control
    AUTHORIZATION: {
        UNAUTHORIZED_ACCESS: "You are not authorized to access this resource.",
        PERMISSION_DENIED: "You do not have the necessary permissions.",
        TOKEN_EXPIRED: "Your session has expired. Please log in again.",
        TOKEN_INVALID: "Invalid authentication token. Please try again.",
        UNAUTHORIZED_ACCESS: "Unauthorized access",
    },

    // ✅ OTP & Verification
    OTP: {
        OTP_SENT: "An OTP has been sent to your registered email.",
        OTP_VERIFIED: "OTP verified successfully.",
        OTP_EXPIRED: "The OTP has expired. Please request a new one.",
        OTP_REQUIRED: "OTP is required for verification.",
    },

    // ✅ Database & Server Errors
    ERROR: {
        INTERNAL_SERVER_ERROR: "An unexpected error occurred. Please try again later.",
        DATABASE_ERROR: "A database error occurred. Please contact support.",
        RESOURCE_NOT_FOUND: "The requested resource could not be found.",
        DUPLICATE_ENTRY: "This record already exists in the system.",
    },

    // ✅ Success Messages
    SUCCESS: {
        DATA_FETCHED: "Data retrieved successfully.",
        DATA_UPDATED: "Data updated successfully.",
        DATA_DELETED: "Data deleted successfully.",
        OPERATION_SUCCESSFUL: "Operation completed successfully.",
    },
};

module.exports = MESSAGES;
