import nodemailer from 'nodemailer';

const hasSmtp = !!(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

const transporter = hasSmtp
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

export const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  if (!transporter) {
    console.log(`\n[DEV] Password reset link for ${toEmail}:\n${resetUrl}\n`);
    return;
  }

  await transporter.sendMail({
    from: `"SmartScrap AI" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Reset your SmartScrap AI password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f5f4f1;border-radius:12px">
        <h2 style="color:#011c6b;margin-bottom:8px">Reset your password</h2>
        <p style="color:#5a5754;font-size:14px;line-height:1.6">
          We received a request to reset the password for your SmartScrap AI account.
          Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
          style="display:inline-block;margin:24px 0;padding:12px 28px;background:#011c6b;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
          Reset Password
        </a>
        <p style="color:#9a9792;font-size:12px">
          If you didn't request this, you can safely ignore this email.<br>
          The link expires in 1 hour.
        </p>
        <hr style="border:none;border-top:1px solid #e3e1dc;margin:24px 0">
        <p style="color:#9a9792;font-size:11px">© 2026 SmartScrap AI</p>
      </div>
    `,
  });
};
