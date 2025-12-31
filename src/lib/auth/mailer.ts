import nodemailer from "nodemailer";
import { APP_URL, SUPPORT_EMAIL } from "./env";

function smtpConfigured() {
  return (
    !!process.env.SMTP_HOST &&
    !!process.env.SMTP_PORT &&
    !!process.env.SMTP_USER &&
    !!process.env.SMTP_PASS &&
    !!process.env.SMTP_FROM
  );
}

export async function sendVerifyEmail(to: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
  const smtpHost = process.env.SMTP_HOST;
  const smtpHostIp = process.env.SMTP_HOST_IP;

  if (!smtpConfigured()) {
    // In dev without SMTP we return the link so it can be opened manually.
    console.warn(
      `SMTP is not configured, skipping email send. Verify link: ${verifyUrl}`
    );
    return { sent: false as const, verifyUrl };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHostIp || smtpHost!,
    port: Number(process.env.SMTP_PORT!),
    secure: Number(process.env.SMTP_PORT!) === 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: smtpHostIp && smtpHost ? { servername: smtpHost } : undefined,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

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

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
  const smtpHost = process.env.SMTP_HOST;
  const smtpHostIp = process.env.SMTP_HOST_IP;

  if (!smtpConfigured()) {
    console.warn(
      `SMTP is not configured, skipping email send. Reset link: ${resetUrl}`
    );
    return { sent: false as const, resetUrl };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHostIp || smtpHost!,
    port: Number(process.env.SMTP_PORT!),
    secure: Number(process.env.SMTP_PORT!) === 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: smtpHostIp && smtpHost ? { servername: smtpHost } : undefined,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

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

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST_IP || process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!),
    secure: Number(process.env.SMTP_PORT!) === 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: process.env.SMTP_HOST_IP && process.env.SMTP_HOST ? { servername: process.env.SMTP_HOST } : undefined,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

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
