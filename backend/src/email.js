const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOtpEmail = async (email, otp) => {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`OTP for ${email}: ${otp}`);
        return;
    }

    await transporter.sendMail({
        from: `Code Explainer <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your login OTP',
        html: `<p>Your one-time login code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    });
};

module.exports = { sendOtpEmail };
