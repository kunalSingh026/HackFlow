const dotenv = require('dotenv');
dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI is not defined in environment variables');
}

if (!process.env.EMAIL_USER) {
  throw new Error('EMAIL_USER is not defined in environment variables');
}

if (!process.env.EMAIL_PASS) {
  throw new Error('EMAIL_PASS is not defined in environment variables');
}

const config = {
  MONGO_URI: process.env.MONGO_URI,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
};

module.exports = config;
