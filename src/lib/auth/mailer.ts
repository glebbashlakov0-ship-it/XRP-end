import nodemailer from "nodemailer";
import { APP_URL, SUPPORT_EMAIL } from "./env";

function smtpConfigured() {
  const hasHost = !!(process.env.SMTP_HOST || process.env.SMTP_HOST_IP);
  return (
    hasHost &&
    !!process.env.SMTP_PORT &&
    !!process.env.SMTP_USER &&
    !!(process.env.SMTP_PASSWORD || process.env.SMTP_PASS) &&
    !!process.env.SMTP_FROM
  );
}

function getSmtpPassword() {
  return process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
}

function isSecureConnection(port: number) {
  const encryption = process.env.SMTP_ENCRYPTION?.toLowerCase();
  if (encryption) {
    return encryption === "ssl";
  }
  return port === 465;
}

function buildTransport() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpHostIp = process.env.SMTP_HOST_IP;
  const port = Number(process.env.SMTP_PORT || 0);

  if (!smtpHost && !smtpHostIp) {
    throw new Error("SMTP host is not configured");
  }

  return nodemailer.createTransport({
    host: smtpHostIp || smtpHost!,
    port,
    secure: isSecureConnection(port),
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: smtpHostIp && smtpHost ? { servername: smtpHost } : undefined,
    auth: {
      user: process.env.SMTP_USER!,
      pass: getSmtpPassword()!,
    },
  });
}

export async function sendVerifyEmail(to: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;

  if (!smtpConfigured()) {
    // In dev without SMTP we return the link so it can be opened manually.
    console.warn(
      `SMTP is not configured, skipping email send. Verify link: ${verifyUrl}`
    );
    return { sent: false as const, verifyUrl };
  }

  const transporter = buildTransport();

  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to,
    subject: "Verify your email - XRP Restaking",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin:0 0 12px;">Confirm your email</h2>
        <p style="margin:0 0 12px;">
          Please confirm your email address to activate your account.
        </p>
        <p style="margin:0 0 18px;">
          <a href="${verifyUrl}" style="display:inline-block;padding:10px 14px;border-radius:999px;background:#111827;color:#fff;text-decoration:none;">
            Verify email
          </a>
        </p>
        <p style="margin:0;color:#6b7280;font-size:12px;">
          If you did not request this, you can ignore this email.
        </p>
      </div>
    `,
  });

  return { sent: true as const, verifyUrl };
}

export async function sendPasswordResetEmail(to: string, token: string, suggestedPassword?: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;

  if (!smtpConfigured()) {
    console.warn(
      `SMTP is not configured, skipping email send. Reset link: ${resetUrl}`
    );
    return { sent: false as const, resetUrl };
  }

  const transporter = buildTransport();

  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to,
    subject: "Reset your password - XRP Restaking",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin:0 0 12px;">Password reset request</h2>
        <p style="margin:0 0 12px;">
          We received a request to reset your password. Use the button below to set a new password.
        </p>
        ${
          suggestedPassword
            ? `<p style="margin:0 0 12px;color:#111827;"><b>Your chosen password (re-enter on the next page):</b><br />${suggestedPassword}</p>`
            : ""
        }
        <p style="margin:0 0 18px;">
          <a href="${resetUrl}" style="display:inline-block;padding:10px 14px;border-radius:999px;background:#111827;color:#fff;text-decoration:none;">
            Reset password
          </a>
        </p>
        <p style="margin:0;color:#6b7280;font-size:12px;">
          If you did not request this, you can ignore this email.
        </p>
      </div>
    `,
  });

  return { sent: true as const, resetUrl };
}

export async function sendSupportEmail(params: {
  fromEmail: string;
  subject: string;
  message: string;
  userId?: string | null;
}) {
  if (!smtpConfigured() || !SUPPORT_EMAIL) {
    console.warn("SMTP or support email is not configured, skipping support email send.");
    return { sent: false as const };
  }

  const transporter = buildTransport();

  const safeSubject = params.subject.trim() || "Support request";
  const safeMessage = params.message.trim() || "(empty message)";

  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to: SUPPORT_EMAIL,
    replyTo: params.fromEmail,
    subject: `[Support] ${safeSubject}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin:0 0 12px;">New support ticket</h2>
        <p style="margin:0 0 8px;"><b>From:</b> ${params.fromEmail}</p>
        <p style="margin:0 0 8px;"><b>User ID:</b> ${params.userId || "n/a"}</p>
        <p style="margin:0 0 12px;"><b>Subject:</b> ${safeSubject}</p>
        <div style="margin:0 0 12px; white-space:pre-wrap;">${safeMessage}</div>
      </div>
    `,
  });

  return { sent: true as const };
}

export async function sendSupportReplyEmail(params: {
  toEmail: string;
  subject: string;
  reply: string;
}) {
  if (!smtpConfigured()) {
    console.warn("SMTP is not configured, skipping support reply send.");
    return { sent: false as const };
  }

  const transporter = buildTransport();
  const safeReply = params.reply.trim() || "(empty reply)";

  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to: params.toEmail,
    subject: params.subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin:0 0 12px;">Support reply</h2>
        <div style="margin:0 0 12px; white-space:pre-wrap;">${safeReply}</div>
        <p style="margin:0;color:#6b7280;font-size:12px;">
          If you need more help, just reply to this email.
        </p>
      </div>
    `,
  });

  return { sent: true as const };
}
