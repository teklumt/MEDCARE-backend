import nodemailer from "nodemailer";
import { Resend } from "resend";
import { APIClient, SendEmailRequest, RegionUS, RegionEU } from "customerio-node";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

// ---------------------------------------------------------------------------
// Provider detection — Customer.io wins, then Resend, then SMTP
// ---------------------------------------------------------------------------
const useCustomerio = Boolean(env.customerio.appApiKey?.trim());
const useResend = !useCustomerio && Boolean(env.resend.apiKey?.trim());
const canUseSmtp = !useCustomerio && !useResend && Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);

export const isMailConfigured = (): boolean => useCustomerio || useResend || canUseSmtp;
export const isSmtpConfigured = (): boolean => isMailConfigured();

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------
const customerioRegion = env.customerio.region === "EU" ? RegionEU : RegionUS;
const customerioClient = useCustomerio
  ? new APIClient(env.customerio.appApiKey!, { region: customerioRegion })
  : null;
const resendClient = useResend ? new Resend(env.resend.apiKey!) : null;
const smtpTransporter = canUseSmtp
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: false,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    })
  : null;

// ---------------------------------------------------------------------------
// Branded HTML email template
// ---------------------------------------------------------------------------
export function buildEmailHtml(opts: { title: string; preheader?: string; body: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#16a34a;padding:32px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="display:inline-table;">
                <tr>
                  <td style="background:#ffffff;width:44px;height:44px;border-radius:10px;text-align:center;vertical-align:middle;">
                    <span style="font-size:28px;font-weight:900;color:#16a34a;line-height:44px;">M</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Med Care</span>
                  </td>
                </tr>
              </table>
              <p style="margin:12px 0 0;color:#dcfce7;font-size:13px;">${opts.preheader ?? opts.title}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              ${opts.body}
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                MED-CARE Ethiopia &mdash; AI-powered healthcare navigation &amp; pharmacy delivery.<br/>
                If you did not request this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function otpBlock(code: string): string {
  return `<div style="background:#f0fdf4;border:2px dashed #86efac;border-radius:10px;padding:24px;text-align:center;margin:24px 0;">
    <p style="margin:0 0 8px;font-size:13px;color:#15803d;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your verification code</p>
    <p style="margin:0;font-size:40px;font-weight:900;letter-spacing:12px;color:#166534;font-family:monospace;">${code}</p>
    <p style="margin:8px 0 0;font-size:12px;color:#6b7280;">Expires in 15 minutes</p>
  </div>`;
}

function toPlainText(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// Provider senders
// ---------------------------------------------------------------------------
async function sendViaCustomerio(to: string, subject: string, html: string): Promise<void> {
  if (!customerioClient) throw new Error("CUSTOMERIO_NOT_INITIALIZED");

  const from = env.customerio.from.trim();
  const region = env.customerio.region;

  logger.info("[customerio] attempting send", { to: to.trim(), subject, from, region });

  const request = new SendEmailRequest({
    to: to.trim(),
    from,
    subject: subject.trim(),
    body: html,
    identifiers: { email: to.trim() },
    body_plain: toPlainText(html),
  });

  try {
    const result = await customerioClient.sendEmail(request);
    logger.info("[customerio] send success", { to: to.trim(), subject, result });
  } catch (err: unknown) {
    // Log the full raw error so we can see exactly what Customer.io returned
    const raw =
      err instanceof Error
        ? { message: err.message, name: err.name, stack: err.stack }
        : err;
    logger.error("[customerio] send failed", {
      to: to.trim(),
      subject,
      from,
      region,
      apiKey: env.customerio.appApiKey ? `${env.customerio.appApiKey.slice(0, 8)}...` : "NOT SET",
      rawError: raw,
    });
    throw err;
  }
}

function formatResendError(err: unknown): string {
  if (!err) return "Resend send failed";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object") {
    const o = err as Record<string, unknown>;
    return [o.name, o.message].filter(Boolean).join(": ") || JSON.stringify(o);
  }
  return String(err);
}

async function sendViaResend(to: string, subject: string, html: string): Promise<void> {
  if (!resendClient) throw new Error("RESEND_NOT_INITIALIZED");
  const result = await resendClient.emails.send({
    from: env.resend.from.trim(),
    to: to.trim(),
    subject: subject.trim(),
    html,
    text: toPlainText(html),
  });
  if (result.error) throw new Error(formatResendError(result.error));
}

async function sendViaSmtp(to: string, subject: string, html: string): Promise<void> {
  if (!smtpTransporter) throw new Error("SMTP_NOT_CONFIGURED");
  await smtpTransporter.sendMail({ from: env.smtp.from, to: to.trim(), subject, html });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Fire-and-forget — logs warning on failure, never throws. */
export const sendMail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    await sendMailStrict(to, subject, html);
  } catch (err) {
    logger.warn("Email send failed (non-critical, skipped)", {
      to: to?.trim() ?? to,
      subject,
      provider: useCustomerio ? "customerio" : useResend ? "resend" : "smtp",
      errMessage: err instanceof Error ? err.message : String(err),
    });
  }
};

/** Send or throw — use for OTP flows where the email must succeed. */
export async function sendMailStrict(to: string, subject: string, html: string): Promise<void> {
  const provider = useCustomerio ? "customerio" : useResend ? "resend" : canUseSmtp ? "smtp" : null;

  if (!provider) throw new Error("SMTP_NOT_CONFIGURED");

  try {
    if (useCustomerio) await sendViaCustomerio(to, subject, html);
    else if (useResend) await sendViaResend(to, subject, html);
    else await sendViaSmtp(to, subject, html);
    logger.info(`Email sent via ${provider}`, { to: to.trim(), subject });
  } catch (err) {
    logger.warn(`${provider} send failed`, {
      to: to.trim(),
      subject,
      errMessage: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
