const { Resend } = require('resend');
const nodemailer = require('nodemailer');
const config = require('./config');

const resend = config.RESEND_API_KEY ? new Resend(config.RESEND_API_KEY) : null;
const isSecure = config.SMTP_SECURE === 'true' || config.SMTP_PORT === '465';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!config.EMAIL_USER || !config.EMAIL_PASS) return null;

  transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: parseInt(config.SMTP_PORT, 10),
    secure: isSecure,
    requireTLS: !isSecure,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return transporter;
};

/**
 * Sends an email using Resend (primary if configured) with automatic fallback to Nodemailer SMTP (secondary/Gmail).
 */
const sendEmail = async ({ to, subject, html, attachments }) => {
  if (process.env.NODE_ENV === 'test') {
    console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
    return { id: 'mock-id' };
  }

  let lastError = null;

  // 1. Try Resend if configured
  if (resend) {
    try {
      console.log(`Attempting to send email to ${to} via Resend...`);
      const payload = {
        from: 'onboarding@resend.dev',
        to,
        subject,
        html,
      };

      if (attachments && attachments.length > 0) {
        payload.attachments = attachments.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentId: att.cid || att.contentId,
        }));
      }

      const { data, error } = await resend.emails.send(payload);
      if (error) {
        throw new Error(error.message || 'Failed to send email via Resend API');
      }
      console.log(`Email successfully sent to ${to} via Resend.`);
      return data;
    } catch (err) {
      console.error(`Resend email sending failed: ${err.message}`);
      lastError = err;
    }
  }

  // 2. Try Nodemailer fallback if configured
  const t = getTransporter();
  if (t) {
    try {
      console.log(`Attempting to send email to ${to} via Nodemailer SMTP fallback...`);
      const mailOptions = {
        from: `HackFlow Team <${config.EMAIL_USER}>`,
        to,
        subject,
        html,
      };

      if (attachments && attachments.length > 0) {
        mailOptions.attachments = attachments.map((att) => ({
          filename: att.filename,
          content: att.content,
          encoding: typeof att.content === 'string' ? 'base64' : undefined,
          cid: att.cid || att.contentId,
        }));
      }

      const info = await t.sendMail(mailOptions);
      console.log(`Email successfully sent to ${to} via Nodemailer SMTP fallback.`);
      return info;
    } catch (err) {
      console.error(`Nodemailer email sending failed: ${err.message}`);
      lastError = err;
    }
  }

  // 3. Neither method succeeded or was configured
  if (lastError) {
    throw new Error(
      `Email delivery failed. Resend & Nodemailer SMTP failed. Last Error: ${lastError.message}`
    );
  } else {
    throw new Error(
      'Email sending failed. Neither Resend nor Nodemailer SMTP credentials are configured.'
    );
  }
};

const verifyEmailConfig = async () => {
  if (config.RESEND_API_KEY) {
    console.log('Resend email service initialized successfully.');
  }
  if (config.EMAIL_USER && config.EMAIL_PASS) {
    console.log('Nodemailer SMTP service initialized successfully.');
  }
  if (!config.RESEND_API_KEY && (!config.EMAIL_USER || !config.EMAIL_PASS)) {
    console.warn(
      'WARNING: Neither Resend API Key nor Nodemailer SMTP credentials are fully configured.'
    );
  }
};

module.exports = {
  sendEmail,
  verifyEmailConfig,
};
