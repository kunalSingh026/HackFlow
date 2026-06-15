const { getTransporter } = require('../config/email');
const config = require('../config/config');

const sendEmail = async (options) => {
  // The HTML Template
  const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2c3e50; text-align: center;">Welcome to HackFlow!</h2>
            <p style="color: #555; font-size: 16px;">Hi there,</p>
            <p style="color: #555; font-size: 16px;">Thank you for registering. To complete your setup and verify your email, please use the following One-Time Password (OTP):</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #3498db; letter-spacing: 5px; padding: 10px 20px; background: #f4f6f7; border-radius: 8px;">${options.otp}</span>
            </div>
            <p style="color: #7f8c8d; font-size: 14px; text-align: center;">This code will expire in 10 minutes.</p>
            <p style="color: #555; font-size: 16px;">Happy Hacking,<br><strong>The HackFlow Team</strong></p>
        </div>
    `;

  //Define the email options
  const mailOptions = {
    from: `HackFlow Team <${config.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: htmlTemplate,
  };

  const transporter = await getTransporter();
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
