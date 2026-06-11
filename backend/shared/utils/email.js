const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`\n========================================`);
    console.log(`[MOCK EMAIL LOG]`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`----------------------------------------`);
    console.log(`Body (HTML preview):`);
    // Simple text preview extraction from HTML tags
    console.log(html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200) + '...');
    console.log(`========================================\n`);
    return { messageId: 'mock-email-id-123456789' };
  }
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'VibeRoommate <noreply@vibeRoommate.com>',
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
};

const emailTemplates = {
  verification: (name, link) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;">
      <h2 style="color:#10b981;">Welcome to VibeRoommate! 🏠</h2>
      <p>Hi ${name},</p>
      <p>Verify your college email to get your <strong>Verified Student</strong> badge.</p>
      <a href="${link}" style="display:inline-block;background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">Verify Email</a>
      <p style="color:#6b7280;font-size:12px;margin-top:24px;">Link expires in 24 hours.</p>
    </div>
  `,

  passwordReset: (otp) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;background:#0f1a1a;border-radius:16px;border:1px solid #1a2e2e;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:#10b981;border-radius:12px;padding:12px 20px;">
          <span style="color:#fff;font-size:20px;font-weight:800;">VibeRoommate 🏠</span>
        </div>
      </div>
      <h2 style="color:#e2e8f0;text-align:center;font-size:22px;margin-bottom:8px;">Password Reset OTP</h2>
      <p style="color:#94a3b8;text-align:center;margin-bottom:28px;">Use this OTP to reset your password. Valid for <strong style="color:#10b981;">15 minutes</strong> only.</p>
      <div style="background:#1a2e2e;border:1.5px solid #10b981;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
        <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#10b981;font-family:monospace;">${otp}</div>
      </div>
      <p style="color:#94a3b8;font-size:13px;text-align:center;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
      <p style="color:#64748b;font-size:11px;text-align:center;margin-top:24px;border-top:1px solid #1a2e2e;padding-top:16px;">© 2025 VibeRoommate. All rights reserved.</p>
    </div>
  `,
  emailVerificationOtp: (otp) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;background:#0f1a1a;border-radius:16px;border:1px solid #1a2e2e;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:#10b981;border-radius:12px;padding:12px 20px;">
          <span style="color:#fff;font-size:20px;font-weight:800;">VibeRoommate 🏠</span>
        </div>
      </div>
      <h2 style="color:#e2e8f0;text-align:center;font-size:22px;margin-bottom:8px;">Verify Your Email</h2>
      <p style="color:#94a3b8;text-align:center;margin-bottom:28px;">Use this OTP to verify your VibeRoommate account. Valid for <strong style="color:#10b981;">15 minutes</strong>.</p>
      <div style="background:#1a2e2e;border:1.5px solid #10b981;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
        <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#10b981;font-family:monospace;">${otp}</div>
      </div>
      <p style="color:#94a3b8;font-size:13px;text-align:center;">Didn't create an account? You can safely ignore this email.</p>
      <p style="color:#64748b;font-size:11px;text-align:center;margin-top:24px;border-top:1px solid #1a2e2e;padding-top:16px;">© 2025 VibeRoommate. All rights reserved.</p>
    </div>
  `,
  safetyCheckin: (data) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;background:#0f1a1a;border-radius:16px;border:1px solid #1a2e2e;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:#10b981;border-radius:12px;padding:12px 20px;">
          <span style="color:#fff;font-size:20px;font-weight:800;">VibeRoommate 🛡️</span>
        </div>
      </div>
      <h2 style="color:#e2e8f0;text-align:center;font-size:22px;margin-bottom:8px;">Safety Check-in Alert</h2>
      <p style="color:#94a3b8;text-align:center;margin-bottom:28px;">
        <strong style="color:#10b981;">${data.userName}</strong> has set you as their trusted contact on VibeRoommate.
        They are planning to meet a potential roommate and wanted to keep you informed.
      </p>
      <div style="background:#1a2e2e;border:1.5px solid #10b981;border-radius:12px;padding:24px;margin:24px 0;">
        <p style="color:#e2e8f0;margin:0 0 12px;"><strong>Meeting Details:</strong></p>
        <p style="color:#94a3b8;margin:6px 0;">📅 Time: <strong style="color:#e2e8f0;">${data.meetingTime}</strong></p>
        <p style="color:#94a3b8;margin:6px 0;">📍 Location: <strong style="color:#e2e8f0;">${data.meetingLocation}</strong></p>
        <p style="color:#94a3b8;margin:6px 0;">👤 Meeting: <strong style="color:#e2e8f0;">${data.otherPersonName || 'a matched roommate'}</strong></p>
      </div>
      <p style="color:#f59e0b;font-size:13px;text-align:center;padding:12px;background:rgba(245,158,11,0.1);border-radius:8px;">
        ⚠️ If you don't hear from ${data.userName} after the meeting, please reach out to them to confirm they are safe.
      </p>
      <p style="color:#64748b;font-size:11px;text-align:center;margin-top:24px;border-top:1px solid #1a2e2e;padding-top:16px;">© 2025 VibeRoommate. All rights reserved.</p>
    </div>
  `,
};

module.exports = { sendEmail, emailTemplates };
