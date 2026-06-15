const { sendEmail: sendResendEmail } = require('../config/email');

const sendTicketEmail = async (options) => {
  const htmlTemplate = `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5; padding: 40px 20px;">
    <!-- Ticket Container -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <tr>
            <!-- Left part (Info) -->
            <td width="65%" style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 40px 30px; color: #ffffff; vertical-align: top;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                        <td style="padding-bottom: 25px;">
                            <p style="margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #93c5fd; font-weight: 600;">Event Ticket</p>
                            <h1 style="margin: 10px 0 0 0; font-size: 28px; font-weight: 800; line-height: 1.2; color: #ffffff;">${options.eventTitle}</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 15px;">
                            <p style="margin: 0; font-size: 11px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px;">Attendee</p>
                            <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 600; color: #ffffff;">${options.username}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 15px;">
                            <p style="margin: 0; font-size: 11px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px;">Date</p>
                            <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 500; color: #ffffff;">${options.eventDate}</p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p style="margin: 0; font-size: 11px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px;">Mode</p>
                            <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 500; color: #ffffff;">${options.eventMode}</p>
                        </td>
                    </tr>
                </table>
            </td>
            
            <!-- Right part (QR) -->
            <td width="35%" style="background-color: #ffffff; border-left: 2px dashed #cbd5e1; padding: 40px 20px; text-align: center; vertical-align: middle;">
                <p style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Admit One</p>
                <img src="cid:qrcode" alt="QR Code" width="140" height="140" style="display: block; margin: 0 auto; border: 4px solid #f1f5f9; border-radius: 8px;" />
                <p style="margin: 20px 0 0 0; font-size: 14px; color: #475569; font-weight: 700; font-family: monospace; letter-spacing: 1px;">${options.ticketId}</p>
                <p style="margin: 5px 0 0 0; font-size: 11px; color: #94a3b8; font-weight: 500; text-transform: uppercase;">Scan at entrance</p>
            </td>
        </tr>
    </table>
    
    <!-- Footer -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 650px; margin: 25px auto 0 auto;">
        <tr>
            <td style="text-align: center;">
                <p style="margin: 0; font-size: 13px; color: #94a3b8; font-weight: 500;">Powered by <span style="color: #3b82f6; font-weight: 700;">HackFlow</span></p>
            </td>
        </tr>
    </table>
</div>`;

  // Extract the base64 data from the data URI string
  const base64Data = options.qrCodeDataUri.split('base64,')[1];

  await sendResendEmail({
    to: options.email,
    subject: `Your Ticket for ${options.eventTitle} 🎟️`,
    html: htmlTemplate,
    attachments: [
      {
        filename: 'qrcode.png',
        content: base64Data,
        cid: 'qrcode', // will be mapped to contentId in email.js
      },
    ],
  });
};
module.exports = sendTicketEmail;
