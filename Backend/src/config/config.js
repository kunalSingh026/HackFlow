const dotenv = require('dotenv');
dotenv.config();

const mongoUri = process.env.MONGO_URI || process.env.Mongo_uri || process.env.mongo_uri;
const emailUser = process.env.EMAIL_USER || process.env.Email_user || process.env.email_user;
let emailPass = process.env.EMAIL_PASS || process.env.Email_pass || process.env.email_pass;
const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret =
  process.env.JWT_REFRESH_SECRET || (jwtSecret ? `${jwtSecret}_refresh` : null);
const frontendUrl =
  process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === 'production' ? null : 'http://localhost:5173');

if (emailPass) {
  // Strip any spaces (Google App Passwords are generated with spaces like "abcd efgh ijkl mnop")
  emailPass = emailPass.replace(/\s+/g, '');
}

if (!mongoUri) {
  throw new Error('MONGO_URI is not defined in environment variables');
}

if (!emailUser) {
  throw new Error('EMAIL_USER is not defined in environment variables');
}

if (!emailPass) {
  throw new Error('EMAIL_PASS is not defined in environment variables');
}

if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

if (process.env.NODE_ENV === 'production' && !frontendUrl) {
  throw new Error(
    'FRONTEND_URL is not defined in environment variables but is required in production'
  );
}

const config = {
  MONGO_URI: mongoUri,
  EMAIL_USER: emailUser,
  EMAIL_PASS: emailPass,
  JWT_SECRET: jwtSecret,
  JWT_REFRESH_SECRET: jwtRefreshSecret,
  FRONTEND_URL: frontendUrl,
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: process.env.SMTP_PORT || '587',
  SMTP_SECURE: process.env.SMTP_SECURE || 'false',
};

module.exports = config;
