import nodemailer from "nodemailer";
import { Resend } from "resend";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

/** Human-readable message from Resend error payload or thrown value. */
function formatResendError(err: unknown): string {
  if (err == null) return "Resend send failed (empty error)";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object") {
    const o = err as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name : "";
    const message = typeof o.message === "string" ? o.message : "";
    if (name || message) {
      return [name, message].filter(Boolean).join(": ").trim();
    }
    try {
      return JSON.stringify(o);
    } catch {
      return "Resend send failed";
    }
  }
  return String(err);
}

/** Winston-safe metadata (avoid `message` — reserved by Winston). */
function errorForLog(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return { errName: err.name, errMessage: err.message };
  }
  if (err && typeof err === "object") return { resendPayload: err as Record<string, unknown> };
  return { errMessage: String(err) };
}

const useResend = Boolean(env.resend.apiKey?.trim());
const canUseSmtp = Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);

/** True when outbound email is configured (Resend API key or full SMTP). */
export const isMailConfigured = (): boolean => useResend || canUseSmtp;

/** Alias for existing call sites — same as {@link isMailConfigured}. */
export const isSmtpConfigured = (): boolean => isMailConfigured();

const mailFrom = (): string =>
  useResend ? env.resend.from : env.smtp.from;

const resendClient = useResend ? new Resend(env.resend.apiKey!) : null;

const transporter =
  !useResend && canUseSmtp
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

function htmlToPlainText(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "(MED-CARE notification)";
}

async function sendViaResend(toRaw: string, subject: string, html: string): Promise<void> {
  if (!resendClient) {
    throw new Error("RESEND_NOT_INITIALIZED");
  }
  const to = toRaw.trim();
  const from = mailFrom().trim();
  const plainText = htmlToPlainText(html);

  const result = await resendClient.emails.send({
    from,
    to,
    subject: subject.trim(),
    html,
    text: plainText,
  });

  if (result.error) {
    const detail = formatResendError(result.error);
    logger.warn("Resend API rejected send", {
      to,
      subject,
      from,
      resendError: result.error,
      detail,
    });
    throw new Error(detail);
  }

  if (result.data == null) {
    logger.warn("Resend returned success with no payload", { to, subject });
    throw new Error("Resend send failed (empty success response)");
  }
}

export const sendMail = async (to: string, subject: string, html: string): Promise<void> => {
  if (useResend && resendClient) {
    try {
      await sendViaResend(to, subject, html);
    } catch (error) {
      logger.warn("Resend send failed, email skipped", {
        to: to.trim(),
        subject,
        ...errorForLog(error),
      });
    }
    return;
  }

  if (!transporter) {
    logger.warn("Email not configured (no RESEND_API_KEY and no SMTP), skipped", { to, subject });
    return;
  }

  try {
    await transporter.sendMail({
      from: env.smtp.from,
      to: to.trim(),
      subject,
      html,
    });
  } catch (error) {
    logger.warn("SMTP send failed, email skipped", {
      to: to.trim(),
      subject,
      ...errorForLog(error),
    });
  }
};

/** Sends mail or throws if no provider is configured or send fails. */
export async function sendMailStrict(to: string, subject: string, html: string): Promise<void> {
  if (useResend && resendClient) {
    try {
      await sendViaResend(to, subject, html);
    } catch (error) {
      logger.warn("Resend send failed", {
        to: to.trim(),
        subject,
        ...errorForLog(error),
      });
      throw error;
    }
    return;
  }

  if (!transporter) {
    throw new Error("SMTP_NOT_CONFIGURED");
  }
  try {
    await transporter.sendMail({
      from: env.smtp.from,
      to: to.trim(),
      subject,
      html,
    });
  } catch (error) {
    logger.warn("SMTP send failed", {
      to: to.trim(),
      subject,
      ...errorForLog(error),
    });
    throw error;
  }
}
