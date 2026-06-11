const Sentry = require('@sentry/node');

// Only initialize Sentry if a DSN is provided.
// Sentry will automatically be inactive if the DSN is missing or empty,
// allowing tests and local development to run smoothly.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
  });
  console.log('Sentry APM successfully initialized.');
} else {
  console.log('Sentry APM is disabled (no SENTRY_DSN found).');
}
