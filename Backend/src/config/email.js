const nodemailer = require('nodemailer');
const config = require('./config');

const isSecure = config.SMTP_SECURE === 'true' || config.SMTP_PORT === '465';

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: parseInt(config.SMTP_PORT, 10),
  secure: isSecure,
  family: 4, // Force IPv4 to prevent ENETUNREACH issues on cloud environments like Render
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully.');
  } catch (error) {
    console.error(
      'SMTP verification failed. Please check your EMAIL_USER and EMAIL_PASS settings.'
    );
    console.error('SMTP Error:', error.message);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`SMTP validation failed: ${error.message}`, { cause: error });
    }
  }
};

module.exports = {
  transporter,
  verifyEmailConfig,
};
