const dotenv = require('dotenv');

// Load environment variables first so they are available to Sentry and other imports
dotenv.config();

// Load Sentry instrumentation before requiring any other app code/modules
require('./src/instrument');

const { connectDB } = require('./src/config/db');
const app = require('./src/app');

// Database Connection
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));