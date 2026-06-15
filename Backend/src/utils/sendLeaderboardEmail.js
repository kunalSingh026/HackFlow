const { getTransporter } = require('../config/email');
const config = require('../config/config');

const sendLeaderboardEmail = async (options) => {
  const htmlTemplate = `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #08070d; color: #f7f6f0; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background: rgba(89, 83, 136, 0.1); border: 1px solid rgba(175, 172, 202, 0.2); border-radius: 20px; padding: 40px 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="margin-bottom: 20px;">
                <span style="font-size: 24px; font-weight: 800; letter-spacing: 2px; color: #afacca;">HACK<span style="color: #595388;">FLOW</span></span>
            </div>
            <hr style="border: none; border-top: 1px solid rgba(175, 172, 202, 0.1); margin: 20px 0;">
            <h1 style="font-size: 26px; font-weight: 700; margin-bottom: 10px; color: #f7f6f0;">Leaderboard Published! 🏆</h1>
            <p style="font-size: 16px; color: #afacca; line-height: 1.6; margin-bottom: 25px; text-align: left;">
                Hi <strong>${options.username}</strong>,<br><br>
                The wait is over! The official final rankings and leaderboard for the event <strong>${options.eventTitle}</strong> have been published. 
                Log in now to view how your team ranked against the competition!
            </p>
            <div style="margin: 30px 0;">
                <a href="${options.leaderboardLink}" style="background-color: #595388; color: #f7f6f0; text-decoration: none; padding: 14px 30px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 12px; box-shadow: 0 4px 20px rgba(89, 83, 136, 0.4); display: inline-block;">View Leaderboard</a>
            </div>
            <p style="font-size: 12px; color: #736d93; margin-top: 30px;">
                If the button above does not work, copy and paste this URL into your browser: <br>
                <a href="${options.leaderboardLink}" style="color: #afacca; text-decoration: underline;">${options.leaderboardLink}</a>
            </p>
            <hr style="border: none; border-top: 1px solid rgba(175, 172, 202, 0.1); margin: 30px 0;">
            <p style="font-size: 12px; color: #736d93; margin: 0;">
                You received this email because you registered for ${options.eventTitle} on HackFlow.
            </p>
        </div>
    </div>
    `;

  const mailOptions = {
    from: `HackFlow Team <${config.EMAIL_USER}>`,
    to: options.email,
    subject: `🏆 Results are Live for ${options.eventTitle}!`,
    html: htmlTemplate,
  };

  const transporter = await getTransporter();
  await transporter.sendMail(mailOptions);
};

module.exports = sendLeaderboardEmail;
