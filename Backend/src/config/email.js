const { Resend } = require('resend');
const config = require('./config');

const resend = config.RESEND_API_KEY ? new Resend(config.RESEND_API_KEY) : null;

/**
 * Sends an email using the Resend HTTP API.
 * Maps Nodemailer attachment options (like `cid`) to Resend's required format (`contentId`).
 */
const sendEmail = async ({ to, subject, html, attachments }) => {
  if (process.env.NODE_ENV === 'test' || !resend) {
    console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
    return { id: 'mock-id' };
  }

  const payload = {
    from: 'onboarding@resend.dev',
    to,
    subject,
    html,
  };

  if (attachments && attachments.length > 0) {
    payload.attachments = attachments.map((att) => ({
      filename: att.filename,
      content: att.content, // Resend accepts base64 string or buffer
      contentId: att.cid || att.contentId, // Map Nodemailer 'cid' to Resend 'contentId'
    }));
  }

  const { data, error } = await resend.emails.send(payload);

  if (error) {
    throw new Error(error.message || 'Failed to send email via Resend API');
  }

  return data;
};

const verifyEmailConfig = async () => {
  if (!config.RESEND_API_KEY) {
    console.warn('WARNING: RESEND_API_KEY is not defined. Email sending will run in mock mode.');
  } else {
    console.log('Resend email service initialized successfully.');
  }
};

module.exports = {
  sendEmail,
  verifyEmailConfig,
};
