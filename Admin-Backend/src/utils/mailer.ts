import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

const canSendMail = Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);

/** True when SMTP env is present (same gate used before creating transporter). */
export const isSmtpConfigured = (): boolean => canSendMail;

const transporter = canSendMail
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: false,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    })
  : null;

export const sendMail = async (to: string, subject: string, html: string): Promise<void> => {
  if (!transporter) {
    logger.warn("SMTP not configured, email skipped", { to, subject });
    return;
  }

  try {
    await transporter.sendMail({
      from: env.smtp.from,
      to,
      subject,
      html,
    });
  } catch (error) {
    logger.warn("SMTP send failed, email skipped", { to, subject, error });
  }
};

/** Sends mail or throws if SMTP is missing or send fails (for flows that must confirm delivery). */
export async function sendMailStrict(to: string, subject: string, html: string): Promise<void> {
  if (!transporter) {
    throw new Error("SMTP_NOT_CONFIGURED");
  }
  try {
    await transporter.sendMail({
      from: env.smtp.from,
      to,
      subject,
      html,
    });
  } catch (error) {
    logger.warn("SMTP send failed", { to, subject, error });
    throw error;
  }
};
