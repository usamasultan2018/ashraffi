const nodemailer = require("nodemailer");


const sendEmail = async (to, subject, text, htmlContent) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS, 
        },
    });

    const mailOptions = {
        from: `"Ashraffi Support" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text, // Fallback for email clients that don’t support HTML
        html: htmlContent, // Main email body
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
