const generateOtpEmail = (username, otp) => `
    <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Your OTP Code</h2>
        <p style="font-size: 16px; color: #555;">
            Hi <strong>${username}</strong>, use the following OTP to verify your account:
        </p>
        <h2 style="color: #007BFF; font-size: 22px;">${otp}</h2>
        <p style="font-size: 14px; color: #777;">
            This OTP will expire in <strong>5 minutes</strong>. If you did not request this, please ignore this email.
        </p>
        <br>
        <p style="font-size: 14px; color: #555;">Best Regards,</p>
        <p style="font-size: 14px; font-weight: bold; color: #333;">Ashraffi Team</p>
    </div>
`;

const generateWelcomeEmail = (username) => `
    <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Welcome to Ashraffi!</h1>
        <p style="font-size: 16px; color: #555;">Hi <strong>${username}</strong>,</p>
        <p style="font-size: 14px; color: #555;">
            We are thrilled to have you as part of our community. Get ready to explore all the features Ashraffi has to offer!
        </p>
        <p style="font-size: 14px; color: #777;">
            If you have any questions, feel free to contact our support team.
        </p>
        <br>
        <p style="font-size: 14px; color: #555;">Best Regards,</p>
        <p style="font-size: 14px; font-weight: bold; color: #333;">Ashraffi Team</p>
    </div>
`;

const generateResetPasswordEmail = (username, resetLink) => `
    <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Reset Your Password</h1>
        <p style="font-size: 16px; color: #555;">Hi <strong>${username}</strong>,</p>
        <p style="font-size: 14px; color: #555;">
            We received a request to reset your password. Click the button below to proceed:
        </p>
        <a href="${resetLink}" 
           style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #007BFF; 
                  color: #fff; text-decoration: none; font-size: 16px; border-radius: 5px;">
            Reset Password
        </a>
        <p style="font-size: 14px; color: #777;">
            If you did not request this, please ignore this email. This link will expire in <strong>30 minutes</strong>.
        </p>
        <br>
        <p style="font-size: 14px; color: #555;">Best Regards,</p>
        <p style="font-size: 14px; font-weight: bold; color: #333;">Ashraffi Team</p>
    </div>
`;

module.exports = {
    generateOtpEmail,
    generateWelcomeEmail,
    generateResetPasswordEmail
};
