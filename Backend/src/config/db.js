const mongoose = require('mongoose');
const config = require('./config');

async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('Connected to DB');
  } catch (error) {
    console.error('Error connecting to DB:', error.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
