const nodemailer = require('nodemailer');

const sendTeamEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let subject = '';
  let htmlTemplate = '';

  // ─── JOIN REQUEST TEMPLATE ──────────────────────────────────────────────────
  if (options.type === 'JOIN_REQUEST') {
    subject = `New Request to join ${options.teamName}! 🚀`;

    htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap" rel="stylesheet"/>
        </head>
        <body style="margin:0; padding:0; background-color:#f5f0e8; font-family:'Space Mono', monospace;">

          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

                  <!-- HEADER BLOCK -->
                  <tr>
                    <td style="
                      background-color: #ffe500;
                      border: 4px solid #000;
                      border-bottom: none;
                      padding: 28px 32px 24px;
                      box-shadow: 6px 6px 0px #000;
                    ">
                      <p style="
                        margin: 0 0 8px 0;
                        font-family: 'Space Mono', monospace;
                        font-size: 11px;
                        font-weight: 700;
                        letter-spacing: 4px;
                        text-transform: uppercase;
                        color: #000;
                        border-bottom: 2px solid #000;
                        padding-bottom: 8px;
                        display: inline-block;
                      ">HackFlow // Notification</p>
                      <h1 style="
                        margin: 12px 0 0 0;
                        font-family: 'Bebas Neue', 'Arial Black', sans-serif;
                        font-size: 62px;
                        line-height: 0.95;
                        color: #000;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                      ">NEW<br>JOIN<br>REQUEST</h1>
                    </td>
                  </tr>

                  <!-- ACCENT STRIPE -->
                  <tr>
                    <td style="
                      background-color: #000;
                      border-left: 4px solid #000;
                      border-right: 4px solid #000;
                      height: 8px;
                      font-size: 0;
                      line-height: 0;
                    ">&nbsp;</td>
                  </tr>

                  <!-- BODY BLOCK -->
                  <tr>
                    <td style="
                      background-color: #fff;
                      border: 4px solid #000;
                      border-top: none;
                      border-bottom: none;
                      padding: 32px;
                    ">
                      <!-- WHO BLOCK -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="
                            border: 3px solid #000;
                            padding: 16px 20px;
                            background-color: #f5f0e8;
                            box-shadow: 4px 4px 0 #000;
                            margin-bottom: 24px;
                          ">
                            <p style="margin:0 0 4px 0; font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#555; font-family:'Space Mono',monospace;">Requested by</p>
                            <p style="margin:0; font-size:22px; font-weight:700; color:#000; font-family:'Space Mono',monospace;">${options.actionUserName}</p>
                          </td>
                        </tr>
                      </table>

                      <div style="height:20px;">&nbsp;</div>

                      <p style="
                        margin: 0 0 12px;
                        font-family: 'Space Mono', monospace;
                        font-size: 13px;
                        line-height: 1.8;
                        color: #000;
                      ">
                        Someone wants in. <strong>${options.actionUserName}</strong> has submitted a request to join your team
                        <strong>${options.teamName}</strong> for the event <strong>${options.eventTitle}</strong>.
                      </p>
                      <p style="
                        margin: 0;
                        font-family: 'Space Mono', monospace;
                        font-size: 13px;
                        line-height: 1.8;
                        color: #555;
                      ">Head to your dashboard to approve or decline.</p>

                      <div style="height:28px;">&nbsp;</div>

                      <!-- CTA BUTTON -->
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="
                            background-color: #000;
                            border: 3px solid #000;
                            box-shadow: 4px 4px 0 #ffe500;
                          ">
                            <a href="#" style="
                              display: inline-block;
                              padding: 14px 32px;
                              font-family: 'Space Mono', monospace;
                              font-size: 13px;
                              font-weight: 700;
                              letter-spacing: 2px;
                              text-transform: uppercase;
                              color: #ffe500;
                              text-decoration: none;
                            ">→ REVIEW REQUEST</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- FOOTER STRIPE -->
                  <tr>
                    <td style="
                      background-color: #000;
                      border-left: 4px solid #000;
                      border-right: 4px solid #000;
                      height: 6px;
                      font-size: 0;
                      line-height: 0;
                    ">&nbsp;</td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="
                      background-color: #fff;
                      border: 4px solid #000;
                      border-top: none;
                      padding: 20px 32px;
                      box-shadow: 6px 6px 0px #000;
                    ">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p style="margin:0; font-family:'Space Mono',monospace; font-size:11px; color:#000; letter-spacing:2px; text-transform:uppercase; font-weight:700;">
                              HACKFLOW
                            </p>
                            <p style="margin:4px 0 0; font-family:'Space Mono',monospace; font-size:10px; color:#888; letter-spacing:1px;">
                              Happy Hacking — The HackFlow Team
                            </p>
                          </td>
                          <td align="right">
                            <p style="margin:0; font-family:'Space Mono',monospace; font-size:10px; color:#bbb; letter-spacing:1px;">
                              © 2025
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>

        </body>
        </html>
        `;

    // ─── TEAM INVITE APPROVED TEMPLATE ──────────────────────────────────────────
  } else if (options.type === 'TEAM_INVITE_APPROVED') {
    subject = `You're in! Welcome to ${options.teamName} 🎉`;

    htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap" rel="stylesheet"/>
        </head>
        <body style="margin:0; padding:0; background-color:#f5f0e8; font-family:'Space Mono', monospace;">

          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

                  <!-- HEADER BLOCK -->
                  <tr>
                    <td style="
                      background-color: #00e5a0;
                      border: 4px solid #000;
                      border-bottom: none;
                      padding: 28px 32px 24px;
                      box-shadow: 6px 6px 0px #000;
                    ">
                      <p style="
                        margin: 0 0 8px 0;
                        font-family: 'Space Mono', monospace;
                        font-size: 11px;
                        font-weight: 700;
                        letter-spacing: 4px;
                        text-transform: uppercase;
                        color: #000;
                        border-bottom: 2px solid #000;
                        padding-bottom: 8px;
                        display: inline-block;
                      ">HackFlow // Notification</p>
                      <h1 style="
                        margin: 12px 0 0 0;
                        font-family: 'Bebas Neue', 'Arial Black', sans-serif;
                        font-size: 62px;
                        line-height: 0.95;
                        color: #000;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                      ">YOU'RE<br>IN THE<br>TEAM.</h1>
                    </td>
                  </tr>

                  <!-- ACCENT STRIPE -->
                  <tr>
                    <td style="
                      background-color: #000;
                      border-left: 4px solid #000;
                      border-right: 4px solid #000;
                      height: 8px;
                      font-size: 0;
                      line-height: 0;
                    ">&nbsp;</td>
                  </tr>

                  <!-- BODY BLOCK -->
                  <tr>
                    <td style="
                      background-color: #fff;
                      border: 4px solid #000;
                      border-top: none;
                      border-bottom: none;
                      padding: 32px;
                    ">

                      <!-- STATUS BADGE -->
                      <table cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                        <tr>
                          <td style="
                            background-color: #00e5a0;
                            border: 3px solid #000;
                            padding: 8px 18px;
                            box-shadow: 3px 3px 0 #000;
                          ">
                            <p style="margin:0; font-family:'Space Mono',monospace; font-size:11px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:#000;">
                              ✓ REQUEST APPROVED
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- TEAM INFO BLOCK -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                        <tr>
                          <td width="48%" style="
                            border: 3px solid #000;
                            padding: 16px 20px;
                            background-color: #f5f0e8;
                            box-shadow: 4px 4px 0 #000;
                          ">
                            <p style="margin:0 0 4px 0; font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#555; font-family:'Space Mono',monospace;">Your Team</p>
                            <p style="margin:0; font-size:18px; font-weight:700; color:#000; font-family:'Space Mono',monospace;">${options.teamName}</p>
                          </td>
                          <td width="4%">&nbsp;</td>
                          <td width="48%" style="
                            border: 3px solid #000;
                            padding: 16px 20px;
                            background-color: #f5f0e8;
                            box-shadow: 4px 4px 0 #000;
                          ">
                            <p style="margin:0 0 4px 0; font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#555; font-family:'Space Mono',monospace;">Event</p>
                            <p style="margin:0; font-size:18px; font-weight:700; color:#000; font-family:'Space Mono',monospace;">${options.eventTitle}</p>
                          </td>
                        </tr>
                      </table>

                      <p style="
                        margin: 0 0 12px;
                        font-family: 'Space Mono', monospace;
                        font-size: 13px;
                        line-height: 1.8;
                        color: #000;
                      ">
                        Your request has been approved by the captain of <strong>${options.teamName}</strong>. You're officially part of the crew for <strong>${options.eventTitle}</strong>.
                      </p>
                      <p style="
                        margin: 0;
                        font-family: 'Space Mono', monospace;
                        font-size: 13px;
                        line-height: 1.8;
                        color: #555;
                      ">Log in to your dashboard and start collaborating with your new teammates.</p>

                      <div style="height:28px;">&nbsp;</div>

                      <!-- CTA BUTTON -->
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="
                            background-color: #000;
                            border: 3px solid #000;
                            box-shadow: 4px 4px 0 #00e5a0;
                          ">
                            <a href="#" style="
                              display: inline-block;
                              padding: 14px 32px;
                              font-family: 'Space Mono', monospace;
                              font-size: 13px;
                              font-weight: 700;
                              letter-spacing: 2px;
                              text-transform: uppercase;
                              color: #00e5a0;
                              text-decoration: none;
                            ">→ GO TO DASHBOARD</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- FOOTER STRIPE -->
                  <tr>
                    <td style="
                      background-color: #000;
                      border-left: 4px solid #000;
                      border-right: 4px solid #000;
                      height: 6px;
                      font-size: 0;
                      line-height: 0;
                    ">&nbsp;</td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="
                      background-color: #fff;
                      border: 4px solid #000;
                      border-top: none;
                      padding: 20px 32px;
                      box-shadow: 6px 6px 0px #000;
                    ">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p style="margin:0; font-family:'Space Mono',monospace; font-size:11px; color:#000; letter-spacing:2px; text-transform:uppercase; font-weight:700;">
                              HACKFLOW
                            </p>
                            <p style="margin:4px 0 0; font-family:'Space Mono',monospace; font-size:10px; color:#888; letter-spacing:1px;">
                              Happy Hacking — The HackFlow Team
                            </p>
                          </td>
                          <td align="right">
                            <p style="margin:0; font-family:'Space Mono',monospace; font-size:10px; color:#bbb; letter-spacing:1px;">
                              © 2025
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>

        </body>
        </html>
        `;
  } else if (options.type === 'TEAM_INVITATION') {
    subject = `You've been invited to join ${options.teamName}! 🤝`;

    htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap" rel="stylesheet"/>
        </head>
        <body style="margin:0; padding:0; background-color:#f5f0e8; font-family:'Space Mono', monospace;">

          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

                  <!-- HEADER BLOCK -->
                  <tr>
                    <td style="
                      background-color: #ffe500;
                      border: 4px solid #000;
                      border-bottom: none;
                      padding: 28px 32px 24px;
                      box-shadow: 6px 6px 0px #000;
                    ">
                      <p style="
                        margin: 0 0 8px 0;
                        font-family: 'Space Mono', monospace;
                        font-size: 11px;
                        font-weight: 700;
                        letter-spacing: 4px;
                        text-transform: uppercase;
                        color: #000;
                        border-bottom: 2px solid #000;
                        padding-bottom: 8px;
                        display: inline-block;
                      ">HackFlow // Matchmaking</p>
                      <h1 style="
                        margin: 12px 0 0 0;
                        font-family: 'Bebas Neue', 'Arial Black', sans-serif;
                        font-size: 62px;
                        line-height: 0.95;
                        color: #000;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                      ">TEAM<br>INVITATION</h1>
                    </td>
                  </tr>

                  <!-- ACCENT STRIPE -->
                  <tr>
                    <td style="
                      background-color: #000;
                      border-left: 4px solid #000;
                      border-right: 4px solid #000;
                      height: 8px;
                      font-size: 0;
                      line-height: 0;
                    ">&nbsp;</td>
                  </tr>

                  <!-- BODY BLOCK -->
                  <tr>
                    <td style="
                      background-color: #fff;
                      border: 4px solid #000;
                      border-top: none;
                      border-bottom: none;
                      padding: 32px;
                    ">
                      <p style="
                        margin: 0 0 12px;
                        font-family: 'Space Mono', monospace;
                        font-size: 14px;
                        line-height: 1.8;
                        color: #000;
                      ">
                        Hi ${options.actionUserName},
                      </p>
                      <p style="
                        margin: 0 0 12px;
                        font-family: 'Space Mono', monospace;
                        font-size: 13px;
                        line-height: 1.8;
                        color: #000;
                      ">
                        The captain of <strong>${options.teamName}</strong> has seen your profile and wants to recruit you for the event <strong>${options.eventTitle}</strong>!
                      </p>

                      <div style="
                        border: 3px solid #000;
                        padding: 16px;
                        background-color: #f5f0e8;
                        box-shadow: 4px 4px 0 #000;
                        margin-bottom: 24px;
                        font-family: 'Space Mono', monospace;
                        font-size: 13px;
                        line-height: 1.6;
                        font-style: italic;
                      ">
                        "Hey, we need a developer like you for ${options.eventTitle}. Would you like to join our team?"
                      </div>

                      <p style="
                        margin: 0;
                        font-family: 'Space Mono', monospace;
                        font-size: 13px;
                        line-height: 1.8;
                        color: #555;
                      ">Log in to your HackFlow dashboard to accept their invitation and join the team.</p>

                      <div style="height:28px;">&nbsp;</div>

                      <!-- CTA BUTTON -->
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="
                            background-color: #000;
                            border: 3px solid #000;
                            box-shadow: 4px 4px 0 #ffe500;
                          ">
                            <a href="http://localhost:5173/dashboard" style="
                              display: inline-block;
                              padding: 14px 32px;
                              font-family: 'Space Mono', monospace;
                              font-size: 13px;
                              font-weight: 700;
                              letter-spacing: 2px;
                              text-transform: uppercase;
                              color: #ffe500;
                              text-decoration: none;
                            ">→ APPROVE REQUEST</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- FOOTER STRIPE -->
                  <tr>
                    <td style="
                      background-color: #000;
                      border-left: 4px solid #000;
                      border-right: 4px solid #000;
                      height: 6px;
                      font-size: 0;
                      line-height: 0;
                    ">&nbsp;</td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="
                      background-color: #fff;
                      border: 4px solid #000;
                      border-top: none;
                      padding: 20px 32px;
                      box-shadow: 6px 6px 0px #000;
                    ">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p style="margin:0; font-family:'Space Mono',monospace; font-size:11px; color:#000; letter-spacing:2px; text-transform:uppercase; font-weight:700;">
                              HACKFLOW
                            </p>
                            <p style="margin:4px 0 0; font-family:'Space Mono',monospace; font-size:10px; color:#888; letter-spacing:1px;">
                              Happy Hacking — The HackFlow Team
                            </p>
                          </td>
                          <td align="right">
                            <p style="margin:0; font-family:'Space Mono',monospace; font-size:10px; color:#bbb; letter-spacing:1px;">
                              © 2026
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>

        </body>
        </html>
        `;
  }

  const mailOptions = {
    from: 'HackFlow Team <noreply@hackflow.com>',
    to: options.email,
    subject: subject,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendTeamEmail;
