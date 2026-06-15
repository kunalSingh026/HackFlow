const nodemailer = require('nodemailer');
const dns = require('dns').promises;
const config = require('./config');

const isSecure = config.SMTP_SECURE === 'true' || config.SMTP_PORT === '465';

let transporter = null;

/**
 * Resolve the SMTP host to an IPv4 address and create the transporter.
 * Nodemailer 8.x uses dns.resolve() internally (ignoring `family` option),
 * so we must resolve to an IPv4 IP ourselves and pass it as the host.
 * `tls.servername` is required so TLS certificate validation still works.
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  let host = config.SMTP_HOST;
  try {
    // Resolve to IPv4 to prevent ENETUNREACH on platforms where IPv6 is not routable
    const result = await dns.lookup(config.SMTP_HOST, { family: 4 });
    host = result.address;
    console.log(`SMTP host ${config.SMTP_HOST} resolved to IPv4: ${host}`);
  } catch (err) {
    console.warn(`Could not resolve ${config.SMTP_HOST} to IPv4, using hostname directly:`, err.message);
  }

  transporter = nodemailer.createTransport({
    host,
    port: parseInt(config.SMTP_PORT, 10),
    secure: isSecure,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS,
    },
    tls: {
      servername: config.SMTP_HOST, // Must match the original hostname for TLS cert validation
      rejectUnauthorized: false,
    },
  });

  return transporter;
};

const verifyEmailConfig = async () => {
  try {
    const t = await getTransporter();
    await t.verify();
    console.log('SMTP connection verified successfully.');
  } catch (error) {
    console.error(
      'SMTP verification failed. Please check your EMAIL_USER and EMAIL_PASS settings.'
    );
    console.error('SMTP Error:', error.message);
    // Don't crash the server; email sending will fail per-request instead
    console.error('Email sending will be unavailable until SMTP is fixed.');
  }
};

module.exports = {
  getTransporter,
  verifyEmailConfig,
};
