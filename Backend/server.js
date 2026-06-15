const dns = require('dns');

// Force Node.js to prefer IPv4 over IPv6 when resolving hostnames.
// This prevents ENETUNREACH errors on cloud platforms like Render where IPv6 is not routed.
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const dotenv = require('dotenv');

// Load environment variables first so they are available to Sentry and other imports
dotenv.config();

// Load Sentry instrumentation before requiring any other app code/modules
require('./src/instrument');

const { connectDB } = require('./src/config/db');
const { verifyEmailConfig } = require('./src/config/email');
const app = require('./src/app');

// Start the server
const startServer = async () => {
  // Database Connection
  await connectDB();

  // Verify SMTP connection (resolves SMTP host to IPv4 first)
  await verifyEmailConfig();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

