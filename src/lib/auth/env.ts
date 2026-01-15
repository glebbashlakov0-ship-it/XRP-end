export const APP_URL = process.env.APP_URL || "http://localhost:3000";

export const VERIFY_TOKEN_TTL_HOURS = 24;
export const RESET_TOKEN_TTL_HOURS = 2;
export const SESSION_TTL_DAYS = 7;
export const RESEND_COOLDOWN_SECONDS = 60;

export const SESSION_COOKIE_NAME = "session";
export const ADMIN_LOGIN_COOKIE_NAME = "admin_session";
export const ADMIN_LOGIN_TTL_DAYS = 7;
export const ADMIN_LOGIN_USERNAME = process.env.ADMIN_LOGIN_USERNAME || "";
export const ADMIN_LOGIN_PASSWORD = process.env.ADMIN_LOGIN_PASSWORD || "";
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.SMTP_FROM || "";
export const DEV_ONLY_ADMIN_LINKS =
  process.env.NODE_ENV !== "production" && process.env.DEV_ONLY_ADMIN_LINKS !== "false";
